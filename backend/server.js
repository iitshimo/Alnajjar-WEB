import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alnajjar';

app.use(cors({ origin: /^http:\/\/(localhost|127\.0\.0\.1):\d+$/ }));
app.use(express.json({ limit: '2mb' }));

const productSchema = new mongoose.Schema({
    nameAr: { type: String, default: '' }, nameEn: { type: String, default: '' },
    category: { type: String, required: true }, price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 }, image: { type: String, default: '' },
    specs: { type: mongoose.Schema.Types.Mixed, default: {} }, colors: { type: [mongoose.Schema.Types.Mixed], default: [] },
    images: { type: [String], default: [] },
    sizes: { type: [String], default: [] }, labels: { type: [String], default: [] },
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);

app.get('/api/health', (_req, res) => res.json({ success: true, service: 'al-najjar-products-api', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', routes: ['GET /api/products', 'POST /api/products', 'PUT /api/products/:id', 'DELETE /api/products/:id'] }));
app.get('/api/products', async (_req, res) => {
    try { res.json({ success: true, data: await Product.find().sort({ createdAt: -1 }).lean() }); }
    catch (error) { console.error('GET /api/products failed:', error); res.status(500).json({ success: false, message: 'Unable to fetch products' }); }
});
app.post('/api/products', async (req, res) => {
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
app.put('/api/products/:id', async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product.toObject() });
    } catch (error) {
        console.error('PUT /api/products failed:', error);
        const status = error.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({ success: false, message: status === 400 ? error.message : 'Unable to update product' });
    }
});
app.delete('/api/products/:id', async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: { id: product.id } });
    } catch (error) { console.error('DELETE /api/products failed:', error); res.status(500).json({ success: false, message: 'Unable to delete product' }); }
});

app.use((_req, res) => res.status(404).json({ success: false, message: 'API route not found. Restart the Al-Najjar backend from the backend folder.' }));
app.use((error, _req, res, _next) => {
    console.error('Unhandled API error:', error);
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
    res.status(status).json({ success: false, message: status === 400 ? error.message : 'Unexpected API error' });
});

try {
    await mongoose.connect(MONGODB_URI);
    console.info('MongoDB connected successfully');
    const server = app.listen(PORT, () => console.info(`API server listening on http://localhost:${PORT}`));
    server.on('error', error => {
        if (error.code === 'EADDRINUSE') console.error(`Port ${PORT} is already in use. Stop the existing API process before starting this server.`);
        else console.error('API server failed to start:', error.message);
        process.exitCode = 1;
    });
} catch (error) {
    console.error(`MongoDB connection failed (${MONGODB_URI}):`, error.message);
    process.exitCode = 1;
}
