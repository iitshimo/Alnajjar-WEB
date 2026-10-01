import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import DeliveryOrder from './models/DeliveryOrder.js';
import createAdminDeliveryOrdersRouter from './routes/adminDeliveryOrders.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AUTH_SECRET = process.env.AUTH_SECRET;
const configuredOrigins = process.env.ALLOWED_ORIGINS;
const allowedOrigins = (configuredOrigins || 'http://localhost:5173,http://localhost:5174')
    .split(',').map(origin => origin.trim()).filter(Boolean);
const isAllowedVercelPreviewOrigin = origin => {
    try {
        const url = new URL(origin);
        return url.protocol === 'https:' && url.hostname.endsWith('.vercel.app');
    } catch {
        return false;
    }
};

if (!MONGODB_URI || !ADMIN_USERNAME || !ADMIN_PASSWORD || !AUTH_SECRET || AUTH_SECRET.length < 32 || (process.env.NODE_ENV === 'production' && !configuredOrigins)) {
    throw new Error('Set MONGODB_URI, ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_SECRET (at least 32 characters), and production ALLOWED_ORIGINS before starting the API.');
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors({ origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isAllowedVercelPreviewOrigin(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
} }));
app.use(express.json({ limit: '2mb' }));

const productSchema = new mongoose.Schema({
    nameAr: { type: String, default: '' }, nameEn: { type: String, default: '' },
    category: { type: String, required: true }, price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 }, image: { type: String, default: '' },
    specs: { type: mongoose.Schema.Types.Mixed, default: {} }, colors: { type: [mongoose.Schema.Types.Mixed], default: [] },
    images: { type: [String], default: [] }, sizes: { type: [String], default: [] }, labels: { type: [String], default: [] },
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);
const SiteSettings = mongoose.model('SiteSettings', new mongoose.Schema({
    _id: { type: String, default: 'site' },
    categories: [mongoose.Schema.Types.Mixed], contact: mongoose.Schema.Types.Mixed,
    hero: mongoose.Schema.Types.Mixed, about: mongoose.Schema.Types.Mixed,
    partners: mongoose.Schema.Types.Mixed, branches: [mongoose.Schema.Types.Mixed],
}, { timestamps: true, versionKey: false }));

const digest = value => crypto.createHash('sha256').update(String(value)).digest();
const safeEqual = (left, right) => crypto.timingSafeEqual(digest(left), digest(right));
const sign = value => crypto.createHmac('sha256', AUTH_SECRET).update(value).digest('base64url');
const createToken = username => {
    const payload = Buffer.from(JSON.stringify({ sub: username, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 })).toString('base64url');
    return `${payload}.${sign(payload)}`;
};
const readToken = token => {
    const [payload, signature, extra] = String(token || '').split('.');
    if (!payload || !signature || extra || !safeEqual(signature, sign(payload))) return null;
    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
        return data.sub === ADMIN_USERNAME && data.exp > Math.floor(Date.now() / 1000) ? data : null;
    } catch { return null; }
};
const requireAdmin = (req, res, next) => {
    const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
    const admin = readToken(token);
    if (!admin) return res.status(401).json({ success: false, message: 'Admin authentication required' });
    req.admin = admin;
    next();
};

const loginAttempts = new Map();
app.post('/api/admin/login', (req, res) => {
    const ip = req.ip;
    const now = Date.now();
    const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
    if (entry.resetAt <= now) { entry.count = 0; entry.resetAt = now + 15 * 60 * 1000; }
    if (entry.count >= 10) return res.status(429).json({ success: false, message: 'Too many login attempts. Try again later.' });
    entry.count += 1;
    loginAttempts.set(ip, entry);
    const username = String(req.body?.username || '');
    const password = String(req.body?.password || '');
    if (!safeEqual(username, ADMIN_USERNAME) || !safeEqual(password, ADMIN_PASSWORD)) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    loginAttempts.delete(ip);
    res.json({ success: true, token: createToken(ADMIN_USERNAME) });
});
app.get('/api/admin/session', requireAdmin, (_req, res) => res.json({ success: true }));
app.use('/api/admin/delivery-orders', requireAdmin, createAdminDeliveryOrdersRouter({ DeliveryOrder }));
app.get('/api/health', (_req, res) => res.json({ success: true, service: 'al-najjar-api', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.get('/api/settings', async (_req, res) => {
    try {
        const settings = await SiteSettings.findById('site').lean();
        res.json({ success: true, data: settings || {} });
    } catch (error) {
        console.error('GET /api/settings failed:', error);
        res.status(500).json({ success: false, message: 'Unable to fetch site settings' });
    }
});
app.put('/api/settings', requireAdmin, async (req, res) => {
    const allowedKeys = ['categories', 'contact', 'hero', 'about', 'partners', 'branches'];
    const changes = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowedKeys.includes(key)));
    if (!Object.keys(changes).length) return res.status(400).json({ success: false, message: 'No supported settings were provided' });
    try {
        const settings = await SiteSettings.findByIdAndUpdate('site', { $set: changes }, { new: true, upsert: true, runValidators: true }).lean();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('PUT /api/settings failed:', error);
        res.status(500).json({ success: false, message: 'Unable to save site settings' });
    }
});

app.get('/api/products', async (_req, res) => {
    try { res.json({ success: true, data: await Product.find().sort({ createdAt: -1 }).lean() }); }
    catch (error) { console.error('GET /api/products failed:', error); res.status(500).json({ success: false, message: 'Unable to fetch products' }); }
});
app.post('/api/products', requireAdmin, async (req, res) => {
    try {
        const { nameAr = '', nameEn = '', category, price, stock = 0, image = '', specs = {}, colors = [], images = [], sizes = [], labels = [] } = req.body;
        if (!category || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
            return res.status(400).json({ success: false, message: 'Category, a valid non-negative price, and a non-negative whole-number stock are required' });
        }
        const product = await Product.create({ nameAr, nameEn, category, price: Number(price), stock: Number(stock), image, specs, colors, images, sizes, labels });
        res.status(201).json({ success: true, data: product.toObject() });
    } catch (error) {
        console.error('POST /api/products failed:', error);
        const status = error.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({ success: false, message: status === 400 ? error.message : 'Unable to save product' });
    }
});
app.put('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
        const fields = ['nameAr', 'nameEn', 'category', 'price', 'stock', 'image', 'specs', 'colors', 'images', 'sizes', 'labels'];
        const changes = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => fields.includes(key)));
        const product = await Product.findByIdAndUpdate(req.params.id, { $set: changes }, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product.toObject() });
    } catch (error) {
        console.error('PUT /api/products failed:', error);
        const status = error.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({ success: false, message: status === 400 ? error.message : 'Unable to update product' });
    }
});
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: { id: product.id } });
    } catch (error) { console.error('DELETE /api/products failed:', error); res.status(500).json({ success: false, message: 'Unable to delete product' }); }
});

app.use((_req, res) => res.status(404).json({ success: false, message: 'API route not found' }));
app.use((error, _req, res, _next) => {
    if (error.message === 'Origin is not allowed by CORS') return res.status(403).json({ success: false, message: error.message });
    console.error('Unhandled API error:', error);
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
    res.status(status).json({ success: false, message: status === 400 ? error.message : 'Unexpected API error' });
});

try {
    await mongoose.connect(MONGODB_URI);
    console.info('MongoDB connected successfully');
    const server = app.listen(PORT, () => console.info(`API server listening on port ${PORT}`));
    server.on('error', error => {
        console.error('API server failed to start:', error.message);
        process.exitCode = 1;
    });
} catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exitCode = 1;
}
