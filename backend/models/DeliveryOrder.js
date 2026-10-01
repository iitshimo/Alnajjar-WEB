import mongoose from 'mongoose';

const deliveryOrderSchema = new mongoose.Schema({
    order_no: { type: String, required: true, trim: true, unique: true, maxlength: 120 },
    route_hub: { type: String, trim: true, default: '', index: true },
    order_date: { type: Date, required: true, index: true },
    salesperson: { type: String, trim: true, default: '' },
    quantity: { type: Number, min: 0, default: null },
    unit: { type: String, trim: true, default: '' },
    customer_name: { type: String, trim: true, default: '' },
    customer_phone: { type: String, trim: true, default: '' },
    delivery_address: { type: String, default: '' },
    delivery_method: { type: String, enum: ['Company Truck', 'Third-Party Transport', 'Customer Pickup'], default: 'Company Truck' },
    driver: { type: String, trim: true, default: '' },
    loading_date: { type: Date, default: null },
    loading_time: { type: String, default: '' },
    expected_delivery_date: { type: Date, default: null, index: true },
    actual_delivery_date: { type: Date, default: null },
    delivery_status: { type: String, enum: ['Pending', 'Loaded', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'], default: 'Pending', index: true },
    delay_reason: { type: String, default: '' },
    invoice_no: { type: String, trim: true, default: '', index: true },
    invoice_date: { type: Date, default: null },
    payment_status: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid', index: true },
    payment_method: { type: String, trim: true, default: '' },
    receipt_no: { type: String, trim: true, default: '' },
    docs_complete: { type: Boolean, default: false },
    general_notes: { type: String, default: '' },
    driver_notes: { type: String, default: '' },
    deletedAt: { type: Date, default: null, index: true },
}, { timestamps: true, versionKey: false });

deliveryOrderSchema.index({ order_no: 'text', customer_name: 'text', customer_phone: 'text', driver: 'text', invoice_no: 'text' });
deliveryOrderSchema.index({ deletedAt: 1, order_date: -1 });

export default mongoose.models.DeliveryOrder || mongoose.model('DeliveryOrder', deliveryOrderSchema);
