import mongoose from 'mongoose';

const fuelRecordSchema = new mongoose.Schema({
    sn: { type: Number, required: true, unique: true, index: true },
    date: { type: String, default: '', trim: true, index: true },
    car: { type: String, default: '', trim: true, index: true },
    driver: { type: String, default: '', trim: true, index: true },
    driverPhone: { type: String, default: '', trim: true },
    startingKm: { type: Number, default: 0 },
    endKm: { type: Number, default: 0 },
    dayVal: { type: Number, default: 0 },
    trip1: { type: String, default: '' },
    trip1Km: { type: Number, default: 0 },
    trip2: { type: String, default: '' },
    trip2Km: { type: Number, default: 0 },
    kmDay: { type: Number, default: 0 },
    difference: { type: Number, default: 0 },
    tnxAuth: { type: String, default: '', trim: true },
    site: { type: String, default: '', trim: true },
    fuel: { type: Number, default: 0, min: 0 },
    lastKm: { type: Number, default: 0 },
    currentKm: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });

fuelRecordSchema.index({ car: 1, driver: 1, sn: -1 });

const fuelCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    value: { type: Number, default: 0 },
}, { versionKey: false });

export const FuelCounter = mongoose.models.FuelCounter || mongoose.model('FuelCounter', fuelCounterSchema);
export default mongoose.models.FuelRecord || mongoose.model('FuelRecord', fuelRecordSchema);
