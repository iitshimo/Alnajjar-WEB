import { useState, useCallback } from 'react';
import { useAdmin } from '../../../context/AdminContext.jsx';
import { useLang } from '../../../context/LanguageContext.jsx';
import { useAutoTranslate } from '../../hooks/useAutoTranslate.js';
import ColorVariantRow from './ColorVariantRow.jsx';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const specsToObj = (arr) => arr.reduce((acc, { key, value }) => {
    if (key.trim()) acc[key.trim()] = value;
    return acc;
}, {});

const objToSpecs = (obj) => Object.entries(obj || {}).map(([key, value]) => ({ key, value }));

const EMPTY = {
    name: { en: '', ar: '', ur: '', zh: '', ru: '', es: '' },
    category: '',
    price: '',
    stock: 0,
    colors: [],
    sizes: [],
    specs: [],
    labels: [],
};

export default function ProductModal({ product, onClose, onSaved }) {
    const { addProduct, updateProduct, categories } = useAdmin();
    const { t, lang } = useLang();
    const isEdit = !!product?.id;
    const { translating, triggerTranslate } = useAutoTranslate({ delay: 600 });
    
    const [form, setForm] = useState(() => {
        if (isEdit) {
            return {
                ...product,
                specs: objToSpecs(product.specs),
                images: product.images || [],
                colors: product.colors || [],
                sizes: product.sizes || [],
                labels: product.labels || [],
            };
        }
        return { ...EMPTY, category: categories[0]?.id || '' };
    });

    const [customSize, setCustomSize] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const setField = useCallback((k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (errors[k]) setErrors(prev => ({ ...prev, [k]: null }));
    }, [errors]);

    const setNameField = (langCode, val) => {
        setForm(f => ({ ...f, name: { ...f.name, [langCode]: val } }));
        if (errors.nameEn) setErrors(prev => ({ ...prev, nameEn: null }));
        
        triggerTranslate(val, langCode, (u) => setForm(f => {
            const update = typeof u === 'function' ? u(f.name) : u;
            return { ...f, name: { ...f.name, ...update } };
        }));
    };

    const addColor = () => setForm(f => ({ 
        ...f, 
        colors: [...f.colors, { color: '#ffffff', label: '', images: [] }] 
    }));
    
    const setColor = (idx, k, v) => setForm(f => ({
        ...f,
        colors: f.colors.map((c, i) => i === idx ? { ...c, [k]: v } : c)
    }));
    
    const removeColor = (idx) => setForm(f => ({
        ...f,
        colors: f.colors.filter((_, i) => i !== idx)
    }));

    const addCustomSize = () => {
        if (!customSize.trim()) return;
        if (!form.sizes.includes(customSize.trim())) {
            setField('sizes', [...form.sizes, customSize.trim()]);
        }
        setCustomSize('');
    };

    const addSpec = () => setForm(f => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }));
    const setSpec = (idx, k, v) => setForm(f => ({
        ...f,
        specs: f.specs.map((s, i) => i === idx ? { ...s, [k]: v } : s)
    }));
    const removeSpec = (idx) => setForm(f => ({
        ...f,
        specs: f.specs.filter((_, i) => i !== idx)
    }));

    const validate = () => {
        const e = {};
        if (!form.name.en.trim() && !form.name.ar.trim()) e.nameEn = 'Product name is required';
        if (!form.price || isNaN(form.price)) e.price = 'Valid price required';
        if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) e.stock = 'Stock must be a non-negative whole number';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        
        // Compute the main image from the first color
        const firstColorImages = form.colors[0]?.images || [];
        const payload = {
            ...form,
            price: parseFloat(form.price),
            specs: specsToObj(form.specs),
            image: firstColorImages[0] || form.image || '',
            images: firstColorImages.length ? firstColorImages : (form.images || []),
            colors: form.colors.filter(c => c.color || c.label),
        };

        try {
            if (isEdit) await updateProduct(product.id, payload);
            else await addProduct(payload);
            onSaved?.(isEdit);
            onClose();
        } catch (error) {
            setErrors(prev => ({ ...prev, save: error.message || 'Unable to save product. Please try again.' }));
        } finally { setSaving(false); }
    };

    const inputCls = (err) => `w-full bg-[#0f0f12] border rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-brand/60 transition-colors ${err ? 'border-red-500' : 'border-white/10'}`;
    const sectionLabel = (text) => <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">{text}</label>;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm" onClick={() => { if (!saving) onClose(); }}>
            <div
                className="bg-[#18181b] border border-white/9 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/7 shrink-0 sticky top-0 bg-[#18181b] z-10">
                    <div className="flex items-center gap-2.5">
                        <span className="material-icons text-brand text-[20px]">{isEdit ? 'edit' : 'add_circle'}</span>
                        <h2 className="text-[15px] font-black text-white">{isEdit ? t.admin.modal.editProduct : t.admin.modal.addProduct}</h2>
                    </div>
                    <button onClick={onClose} disabled={saving} className="w-8 h-8 rounded-xl bg-white/6 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-50">
                        <span className="material-icons text-[18px]">close</span>
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-5 overflow-y-auto">
                    {/* ── Category + Price ── */}
                    <div className="flex flex-col gap-2">
                        {sectionLabel(`${t.admin.modal.pCategory} - ${t.admin.modal.pPrice}`)}
                        <div className="grid grid-cols-2 gap-3">
                            <select value={form.category} onChange={e => setField('category', e.target.value)} className={inputCls(false)}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.label?.en || c.label}</option>)}
                            </select>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-zinc-500 font-bold uppercase">OMR</span>
                                <input type="number" step="0.01" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="0.00"
                                    className={`${inputCls(errors.price)} pl-12`} />
                            </div>
                        </div>
                    </div>

                    {/* ── Product Name ── */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            {sectionLabel(t.admin.modal.pName)}
                            {translating ? (
                                <span className="flex items-center gap-1.5 text-[10px] text-brand font-bold animate-pulse">
                                    <span className="material-icons text-[12px]">sync</span> Translating…
                                </span>
                            ) : (
                                <span className="text-[10px] text-zinc-600">Auto-translates ✨</span>
                            )}
                        </div>
                        {lang === 'en' ? (
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand uppercase">EN</span>
                                <input type="text" value={form.name.en} onChange={e => setNameField('en', e.target.value)}
                                    placeholder="Product name in English…"
                                    className={`${inputCls(errors.nameEn)} pl-9 text-[13px] font-semibold`} />
                            </div>
                        ) : (
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand uppercase">AR</span>
                                <input type="text" dir="rtl" value={form.name.ar} onChange={e => setNameField('ar', e.target.value)}
                                    placeholder="اسم المنتج بالعربي…"
                                    className={`${inputCls(errors.nameEn)} pl-9 text-[13px] font-semibold`} />
                            </div>
                        )}
                        {errors.nameEn && <span className="text-[10px] text-red-400">{errors.nameEn}</span>}
                    </div>

                    {/* ── Color Variants ── */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            {sectionLabel('Color Variants & Images')}
                            <button onClick={addColor} className="flex items-center gap-1 text-[10px] font-bold text-brand hover:text-brand/80">
                                <span className="material-icons text-[14px]">add_circle</span> Add Color
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {form.colors.map((cv, i) => (
                                <ColorVariantRow
                                    key={i}
                                    index={i}
                                    cv={cv}
                                    onColorChange={(val) => setColor(i, 'color', val)}
                                    onLabelChange={(val) => setColor(i, 'label', val)}
                                    onImagesChange={(imgs) => setColor(i, 'images', imgs)}
                                    onRemove={() => removeColor(i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ── Sizes ── */}
                    <div className="flex flex-col gap-2">
                        {sectionLabel('Sizes (cm)')}
                        <div className="flex items-center gap-2">
                            <input type="text" value={customSize} onChange={e => setCustomSize(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && addCustomSize()} placeholder="e.g. 60×60…" className={`${inputCls(false)} flex-1`} />
                            <button type="button" onClick={addCustomSize} className="h-[43px] px-4 rounded-xl bg-brand text-black text-[12px] font-black hover:bg-brand/80">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.sizes.map(s => (
                                <span key={s} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand text-[12px] font-bold">
                                    {s}
                                    <button onClick={() => setField('sizes', form.sizes.filter(x => x !== s))} className="w-4 h-4 rounded-full bg-brand/20 flex items-center justify-center">
                                        <span className="material-icons text-[10px]">close</span>
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Specifications ── */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            {sectionLabel('Specifications')}
                            <button onClick={addSpec} className="flex items-center gap-1 text-[10px] font-bold text-brand hover:text-brand/80">
                                <span className="material-icons text-[14px]">add</span> Add Row
                            </button>
                        </div>
                        <div className="bg-[#0f0f12] border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/4">
                            {form.specs.map((spec, i) => (
                                <div key={i} className="flex items-stretch group/spec">
                                    <input type="text" value={spec.key} onChange={e => setSpec(i, 'key', e.target.value)} placeholder="Property…" 
                                        className="flex-1 bg-transparent px-4 py-3 text-[12px] text-zinc-400 focus:outline-none focus:text-brand border-r border-white/4" />
                                    <input type="text" value={spec.value} onChange={e => setSpec(i, 'value', e.target.value)} placeholder="Value…" 
                                        className="flex-1 bg-transparent px-4 py-3 text-[13px] text-white focus:outline-none" />
                                    <button onClick={() => removeSpec(i)} className="w-10 flex items-center justify-center text-zinc-700 hover:text-red-400 opacity-0 group-hover/spec:opacity-100 transition-opacity">
                                        <span className="material-icons text-[16px]">delete_outline</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 px-5 py-4 border-t border-white/7 shrink-0 sticky bottom-0 bg-[#18181b]">
                    {errors.save && <span className="text-xs text-red-400">{errors.save}</span>}
                    <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[13px] font-semibold text-zinc-300 disabled:opacity-50">{t.admin.modal.cancel}</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand/80 text-[13px] font-black text-black transition-colors disabled:opacity-50">
                        {saving ? <span className="inline-flex items-center gap-2"><span className="material-icons text-base animate-spin">refresh</span>Saving...</span> : isEdit ? t.admin.modal.save : t.admin.products.addNewProduct}
                    </button>
                </div>
            </div>
        </div>
    );
}
