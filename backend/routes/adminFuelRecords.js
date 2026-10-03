import express from 'express';
import mongoose from 'mongoose';

const FUEL_COUNTER_ID = 'fuel-records';
const numericFields = ['sn', 'startingKm', 'endKm', 'dayVal', 'trip1Km', 'trip2Km', 'kmDay', 'difference', 'fuel', 'lastKm', 'currentKm'];
const stringFields = ['date', 'car', 'driver', 'driverPhone', 'trip1', 'trip2', 'tnxAuth', 'site'];
const searchableFields = ['car', 'driver', 'driverPhone', 'site', 'trip1', 'trip2', 'tnxAuth'];

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parseDate = value => {
    if (!value) return null;
    const time = Date.parse(String(value));
    return Number.isFinite(time) ? time : null;
};

export function normalizeFuelRecord(body = {}, { partial = false } = {}) {
    const record = {};
    for (const key of stringFields) {
        if (partial && !Object.hasOwn(body, key)) continue;
        record[key] = String(body[key] ?? '').trim();
    }
    for (const key of numericFields) {
        if (partial && !Object.hasOwn(body, key)) continue;
        const raw = body[key];
        if (key === 'sn' && (raw === undefined || raw === null || raw === '')) continue;
        const value = raw === undefined || raw === null || raw === '' ? 0 : Number(raw);
        if (!Number.isFinite(value)) throw new Error(`${key} must be a valid number`);
        if (key === 'fuel' && value < 0) throw new Error('fuel cannot be negative');
        record[key] = value;
    }
    return record;
}

export async function nextFuelSerial(FuelCounter) {
    const counter = await FuelCounter.findOneAndUpdate(
        { _id: FUEL_COUNTER_ID },
        { $inc: { value: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return counter.value;
}

export async function syncFuelSerial(FuelRecord, FuelCounter) {
    const highest = await FuelRecord.findOne().sort({ sn: -1 }).select('sn').lean();
    await FuelCounter.updateOne(
        { _id: FUEL_COUNTER_ID },
        { $max: { value: Number(highest?.sn) || 0 } },
        { upsert: true },
    );
}

export default function createAdminFuelRecordsRouter({ FuelRecord, FuelCounter }) {
    const router = express.Router();

    router.get('/', async (req, res, next) => {
        try {
            const query = {};
            const search = String(req.query.search || '').trim();
            const vehicle = String(req.query.vehicle || '').trim();
            const driver = String(req.query.driver || '').trim();
            if (vehicle) query.car = { $regex: escapeRegex(vehicle), $options: 'i' };
            if (driver) query.driver = { $regex: `^${escapeRegex(driver)}$`, $options: 'i' };
            if (search) {
                const expression = { $regex: escapeRegex(search.slice(0, 120)), $options: 'i' };
                query.$or = searchableFields.map(field => ({ [field]: expression }));
            }

            let records = await FuelRecord.find(query).sort({ sn: -1 }).lean();
            const from = parseDate(req.query.date_from);
            const to = parseDate(req.query.date_to);
            if (from !== null || to !== null) {
                records = records.filter(record => {
                    const date = parseDate(record.date);
                    return date !== null && (from === null || date >= from) && (to === null || date <= to);
                });
            }
            res.json({ success: true, data: records });
        } catch (error) { next(error); }
    });

    router.post('/', async (req, res) => {
        try {
            const record = normalizeFuelRecord(req.body);
            if (!Number.isFinite(record.sn)) record.sn = await nextFuelSerial(FuelCounter);
            else await FuelCounter.updateOne({ _id: FUEL_COUNTER_ID }, { $max: { value: record.sn } }, { upsert: true });
            const saved = await FuelRecord.create(record);
            res.status(201).json({ success: true, data: saved.toObject() });
        } catch (error) {
            const status = error.code === 11000 ? 409 : 400;
            res.status(status).json({ success: false, message: error.message || 'Unable to create fuel record' });
        }
    });

    router.put('/:id', async (req, res) => {
        try {
            if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid fuel record ID' });
            const changes = normalizeFuelRecord(req.body, { partial: true });
            if (Object.hasOwn(changes, 'sn')) {
                await FuelCounter.updateOne({ _id: FUEL_COUNTER_ID }, { $max: { value: changes.sn } }, { upsert: true });
            }
            const saved = await FuelRecord.findByIdAndUpdate(req.params.id, { $set: changes }, { new: true, runValidators: true });
            if (!saved) return res.status(404).json({ success: false, message: 'Fuel record not found' });
            res.json({ success: true, data: saved.toObject() });
        } catch (error) {
            const status = error.code === 11000 ? 409 : 400;
            res.status(status).json({ success: false, message: error.message || 'Unable to update fuel record' });
        }
    });

    router.delete('/:id', async (req, res, next) => {
        try {
            if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid fuel record ID' });
            const removed = await FuelRecord.findByIdAndDelete(req.params.id);
            if (!removed) return res.status(404).json({ success: false, message: 'Fuel record not found' });
            res.json({ success: true, data: { id: removed.id, sn: removed.sn } });
        } catch (error) { next(error); }
    });

    router.post('/bulk', async (req, res) => {
        try {
            const input = Array.isArray(req.body) ? req.body : req.body?.records;
            if (!Array.isArray(input) || input.length === 0) return res.status(400).json({ success: false, message: 'Provide a non-empty records array' });
            if (input.length > 10000) return res.status(413).json({ success: false, message: 'Import is limited to 10,000 records at a time' });

            const records = [];
            for (const source of input) {
                const record = normalizeFuelRecord(source);
                if (!Number.isFinite(record.sn)) record.sn = await nextFuelSerial(FuelCounter);
                else await FuelCounter.updateOne({ _id: FUEL_COUNTER_ID }, { $max: { value: record.sn } }, { upsert: true });
                records.push(record);
            }
            const result = await FuelRecord.bulkWrite(records.map(record => ({
                updateOne: { filter: { sn: record.sn }, update: { $set: record }, upsert: true },
            })), { ordered: false });
            res.json({ success: true, data: { imported: result.upsertedCount + result.modifiedCount, matched: result.matchedCount } });
        } catch (error) {
            const status = error.code === 11000 ? 409 : 400;
            res.status(status).json({ success: false, message: error.message || 'Unable to import fuel records' });
        }
    });

    return router;
}
