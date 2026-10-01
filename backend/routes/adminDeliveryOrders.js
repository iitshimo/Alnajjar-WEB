import express from 'express';
import mongoose from 'mongoose';

const deliveryStatuses = ['Pending', 'Loaded', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'];
const paymentStatuses = ['Unpaid', 'Partial', 'Paid'];
const deliveryFields = [
    'order_no', 'route_hub', 'order_date', 'salesperson', 'quantity', 'unit', 'customer_name', 'customer_phone', 'delivery_address',
    'delivery_method', 'driver', 'loading_date', 'loading_time', 'expected_delivery_date', 'actual_delivery_date', 'delivery_status',
    'delay_reason', 'invoice_no', 'invoice_date', 'payment_status', 'payment_method', 'receipt_no', 'docs_complete', 'general_notes', 'driver_notes',
];
const dateFields = ['order_date', 'loading_date', 'expected_delivery_date', 'actual_delivery_date', 'invoice_date'];
const routeFromOrder = value => String(value || '').split(/\s+-\s+|\s+–\s+|\s+—\s+/)[0].trim().toUpperCase();

function normalizeDelivery(body, partial = false) {
    const value = Object.fromEntries(Object.entries(body || {}).filter(([key]) => deliveryFields.includes(key)));
    if (!partial || Object.hasOwn(value, 'order_no')) value.order_no = String(value.order_no || '').trim();
    if (!partial || Object.hasOwn(value, 'route_hub')) value.route_hub = String(value.route_hub || routeFromOrder(value.order_no)).trim().toUpperCase();

    for (const key of dateFields) {
        if (!Object.hasOwn(value, key)) continue;
        if (value[key] === '' || value[key] === null) value[key] = null;
        else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value[key]))
            || !Number.isFinite(Date.parse(`${value[key]}T00:00:00Z`))
            || new Date(`${value[key]}T00:00:00Z`).toISOString().slice(0, 10) !== String(value[key])) {
            throw new Error(`${key} must be a valid YYYY-MM-DD date`);
        }
    }

    if (!partial && !value.order_date) throw new Error('order_date is required');
    if (!partial && !value.order_no) throw new Error('order_no is required');
    if (Object.hasOwn(value, 'quantity')) {
        if (value.quantity === '' || value.quantity === null) value.quantity = null;
        else if (!Number.isFinite(Number(value.quantity)) || Number(value.quantity) < 0) throw new Error('quantity must be a non-negative number');
        else value.quantity = Number(value.quantity);
    }
    if (Object.hasOwn(value, 'customer_phone')) value.customer_phone = String(value.customer_phone || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
    if (Object.hasOwn(value, 'docs_complete')) value.docs_complete = value.docs_complete === true || value.docs_complete === 'true' || value.docs_complete === 'Yes';
    return value;
}

function buildDeliveryFilter(query) {
    const filter = { deletedAt: null };
    if (query.route) filter.route_hub = String(query.route).toUpperCase();
    if (deliveryStatuses.includes(query.delivery_status)) filter.delivery_status = query.delivery_status;
    if (paymentStatuses.includes(query.payment_status)) filter.payment_status = query.payment_status;

    if (query.search?.trim()) {
        const search = query.search.trim().slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$and = [...(filter.$and || []), {
            $or: ['order_no', 'customer_name', 'customer_phone', 'driver', 'invoice_no'].map(field => ({ [field]: { $regex: search, $options: 'i' } })),
        }];
    }
    if (query.date_from || query.date_to) {
        const range = {};
        if (query.date_from && /^\d{4}-\d{2}-\d{2}$/.test(query.date_from)) range.$gte = new Date(`${query.date_from}T00:00:00Z`);
        if (query.date_to && /^\d{4}-\d{2}-\d{2}$/.test(query.date_to)) range.$lte = new Date(`${query.date_to}T23:59:59.999Z`);
        if (Object.keys(range).length) filter.$and = [...(filter.$and || []), { $or: [{ order_date: range }, { expected_delivery_date: range }] }];
    }
    return filter;
}

function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (quoted && char === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (char === '"') quoted = !quoted;
        else if (char === ',' && !quoted) { row.push(field); field = ''; }
        else if ((char === '\n' || char === '\r') && !quoted) {
            if (char === '\r' && text[i + 1] === '\n') i++;
            row.push(field);
            if (row.some(cell => cell.trim())) rows.push(row);
            row = [];
            field = '';
        } else field += char;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows.shift().map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, '') : header).trim());
    return rows.map((cells, index) => ({ row: index + 2, value: Object.fromEntries(headers.map((key, column) => [key, cells[column] ?? ''])) }));
}

function validationResponse(res, error, fallback) {
    const clientError = error.name === 'ValidationError' || error.message?.includes('required') || error.message?.includes('must be');
    const status = error.code === 11000 ? 409 : clientError ? 400 : 500;
    res.status(status).json({ success: false, message: error.code === 11000 ? 'That order number already exists' : clientError ? error.message : fallback });
}

export default function createAdminDeliveryOrdersRouter({ DeliveryOrder }) {
    const router = express.Router();

    router.get('/stats', async (_req, res, next) => {
        try {
            const [result] = await DeliveryOrder.aggregate([{ $match: { deletedAt: null } }, { $facet: {
                summary: [{ $group: { _id: null,
                    total_orders: { $sum: 1 },
                    in_progress: { $sum: { $cond: [{ $in: ['$delivery_status', ['Pending', 'Loaded', 'In Transit']] }, 1, 0] } },
                    delivered: { $sum: { $cond: [{ $eq: ['$delivery_status', 'Delivered'] }, 1, 0] } },
                    delayed: { $sum: { $cond: [{ $eq: ['$delivery_status', 'Delayed'] }, 1, 0] } },
                    unpaid_or_partial: { $sum: { $cond: [{ $in: ['$payment_status', ['Unpaid', 'Partial']] }, 1, 0] } },
                } }],
                routes: [{ $match: { route_hub: { $ne: '' } } }, { $group: { _id: '$route_hub' } }, { $sort: { _id: 1 } }],
            } }]);
            res.json({ success: true, data: {
                ...(result?.summary?.[0] || { total_orders: 0, in_progress: 0, delivered: 0, delayed: 0, unpaid_or_partial: 0 }),
                routes: (result?.routes || []).map(route => route._id),
            } });
        } catch (error) { next(error); }
    });

    router.get('/export', async (req, res, next) => {
        try {
            const allowedSort = [...deliveryFields, 'createdAt', 'updatedAt'];
            const sortBy = allowedSort.includes(req.query.sort_by) ? req.query.sort_by : 'order_date';
            res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="delivery-orders.csv"', 'Cache-Control': 'no-store' });
            const escapeCsv = value => {
                let text = String(value ?? '');
                if (/^[\s]*[=+@\t]/.test(text) || /^[\s]*-[^\d]/.test(text)) text = `'${text}`;
                return `"${text.replaceAll('"', '""')}"`;
            };
            res.write(`\uFEFF${deliveryFields.map(escapeCsv).join(',')}\r\n`);
            const cursor = DeliveryOrder.find(buildDeliveryFilter(req.query)).sort({ [sortBy]: req.query.sort_dir === 'asc' ? 1 : -1 }).lean().cursor();
            for await (const order of cursor) {
                const line = deliveryFields.map(key => escapeCsv(order[key] instanceof Date ? order[key].toISOString().slice(0, 10) : order[key])).join(',') + '\r\n';
                if (!res.write(line)) await new Promise(resolve => res.once('drain', resolve));
            }
            res.end();
        } catch (error) { if (res.headersSent) res.destroy(error); else next(error); }
    });

    router.get('/', async (req, res, next) => {
        try {
            const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
            const limit = [25, 50, 100].includes(Number(req.query.limit)) ? Number(req.query.limit) : 25;
            const allowedSort = [...deliveryFields, 'createdAt', 'updatedAt'];
            const sortBy = allowedSort.includes(req.query.sort_by) ? req.query.sort_by : 'order_date';
            const sort = { [sortBy]: req.query.sort_dir === 'asc' ? 1 : -1, _id: -1 };
            const filter = buildDeliveryFilter(req.query);
            const [data, total] = await Promise.all([
                DeliveryOrder.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
                DeliveryOrder.countDocuments(filter),
            ]);
            res.json({ success: true, data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
        } catch (error) { next(error); }
    });

    router.post('/', async (req, res) => {
        try { res.status(201).json({ success: true, data: await DeliveryOrder.create(normalizeDelivery(req.body)) }); }
        catch (error) { validationResponse(res, error, 'Unable to create delivery order'); }
    });

    router.get('/:id', async (req, res, next) => {
        try {
            if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid delivery order ID' });
            const order = await DeliveryOrder.findOne({ _id: req.params.id, deletedAt: null }).lean();
            if (!order) return res.status(404).json({ success: false, message: 'Delivery order not found' });
            res.json({ success: true, data: order });
        } catch (error) { next(error); }
    });

    const updateOrder = async (req, res) => {
        try {
            if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid delivery order ID' });
            const order = await DeliveryOrder.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { $set: normalizeDelivery(req.body, true) }, { new: true, runValidators: true });
            if (!order) return res.status(404).json({ success: false, message: 'Delivery order not found' });
            res.json({ success: true, data: order });
        } catch (error) { validationResponse(res, error, 'Unable to update delivery order'); }
    };
    router.put('/:id', updateOrder);
    router.patch('/:id', updateOrder);

    router.patch('/:id/quick-status', async (req, res, next) => {
        try {
            if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid delivery order ID' });
            if (!deliveryStatuses.includes(req.body?.delivery_status)) return res.status(400).json({ success: false, message: 'Invalid delivery status' });
            const order = await DeliveryOrder.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { $set: { delivery_status: req.body.delivery_status } }, { new: true, runValidators: true });
            if (!order) return res.status(404).json({ success: false, message: 'Delivery order not found' });
            res.json({ success: true, data: order });
        } catch (error) { next(error); }
    });

    router.delete('/:id', async (req, res, next) => {
        try {
            if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid delivery order ID' });
            const order = await DeliveryOrder.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });
            if (!order) return res.status(404).json({ success: false, message: 'Delivery order not found' });
            res.json({ success: true, data: { id: order.id } });
        } catch (error) { next(error); }
    });

    router.post('/bulk-import', async (req, res) => {
        try {
            const chunks = [];
            let size = 0;
            for await (const chunk of req) {
                size += chunk.length;
                if (size > 10 * 1024 * 1024) return res.status(413).json({ success: false, message: 'CSV file must be smaller than 10 MB' });
                chunks.push(chunk);
            }
            const body = Buffer.concat(chunks);
            const contentType = req.get('content-type') || '';
            let csv = '';
            if (contentType.includes('multipart/form-data')) {
                const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
                if (!boundary) return res.status(400).json({ success: false, message: 'Invalid multipart upload' });
                const parts = body.toString('latin1').split(`--${boundary[1] || boundary[2]}`);
                const file = parts.find(part => /filename="[^"]+"/i.test(part));
                if (!file) return res.status(400).json({ success: false, message: 'Select a CSV file to import' });
                csv = Buffer.from(file.slice(file.indexOf('\r\n\r\n') + 4).replace(/\r\n$/, ''), 'latin1').toString('utf8');
            } else csv = body.toString('utf8');

            const rows = parseCsv(csv);
            if (!rows.length) return res.status(400).json({ success: false, message: 'CSV has no data rows' });
            const errors = [];
            const valid = [];
            for (const item of rows) {
                try { valid.push({ row: item.row, value: normalizeDelivery(item.value) }); }
                catch (error) { errors.push({ row: item.row, order_no: item.value.order_no || '', message: error.message }); }
            }
            let imported = 0;
            for (const item of valid) {
                try {
                    await DeliveryOrder.findOneAndUpdate({ order_no: item.value.order_no }, { $set: item.value }, { upsert: true, new: true, runValidators: true });
                    imported++;
                } catch (error) { errors.push({ row: item.row, order_no: item.value.order_no, message: error.code === 11000 ? 'Duplicate order number' : error.message }); }
            }
            res.json({ success: true, data: { imported, errors } });
        } catch (error) {
            console.error('POST /api/admin/delivery-orders/bulk-import failed:', error);
            res.status(500).json({ success: false, message: 'Unable to import CSV file' });
        }
    });

    return router;
}
