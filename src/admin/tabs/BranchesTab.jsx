import { useState, useRef, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import { useAutoTranslate } from '../hooks/useAutoTranslate.js';

const fileToBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
});

const TYPE_META = {
    branch:    { icon: 'storefront',  color: 'bg-brand/10 text-brand' },
    showroom:  { icon: 'museum',      color: 'bg-blue-500/10 text-blue-400' },
    warehouse: { icon: 'warehouse',   color: 'bg-zinc-500/10 text-zinc-400' },
};

const EMPTY = { nameEn: '', nameAr: '', address: '', phone: '', mapUrl: '', country: 'OM', type: 'branch', image: '', hoursEn: '', hoursAr: '' };

export default function BranchesTab() {
    const { branches, addBranch, updateBranch, deleteBranch, resetBranches } = useAdmin();
    const { t, lang } = useLang();
    const isRtl = lang === 'ar';
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');
    const { translating, triggerTranslate } = useAutoTranslate({ delay: 600 });

    const openAdd = () => { setForm({ ...EMPTY }); setError(''); setModal({ mode: 'add' }); };
    const openEdit = (b) => { setForm({ ...b }); setError(''); setModal({ mode: 'edit', branch: b }); };
    const closeModal = () => setModal(null);
    const fileInputRef = useRef(null);

    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const b64 = await fileToBase64(file);
        setForm(f => ({ ...f, image: b64 }));
        e.target.value = '';
    }, []);

    const setFormField = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        setError('');

        // Auto-translate logic
        const syncMap = {
            nameEn: { from: 'en', to: 'nameAr' },
            nameAr: { from: 'ar', to: 'nameEn' },
            hoursEn: { from: 'en', to: 'hoursAr' },
            hoursAr: { from: 'ar', to: 'hoursEn' },
        };

        if (syncMap[key]) {
            const { from, to } = syncMap[key];
            triggerTranslate(val, from, (update) => {
                setForm(f => {
                    const res = typeof update === 'function' ? update({}) : update;
                    const val = from === 'en' ? res.ar : res.en;
                    return val ? { ...f, [to]: val } : f;
                });
            });
        }
    };

    const handleSave = () => {
        if (!form.nameEn.trim() && !form.nameAr.trim()) { setError('Name required'); return; }
        if (!form.address.trim()) { setError('Address required'); return; }
        if (modal.mode === 'add') addBranch(form);
        else updateBranch(modal.branch.id, form);
        closeModal();
    };

    const inp = 'w-full bg-[#0f0f12] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-brand/50 placeholder:text-zinc-700';
    const lbl = 'text-[10px] text-zinc-500 font-semibold uppercase tracking-wide mb-1';

    return (
        <>
            {/* ── Header stats & add button ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex flex-wrap gap-3">
                    <div className="bg-white/5 rounded-2xl px-5 py-3 flex items-center gap-3">
                        <p className="text-2xl font-black text-white">{branches.length}</p>
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                            {isRtl ? 'إجمالي الفروع' : 'Total Branches'}
                        </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl px-5 py-3 flex items-center gap-3">
                        <p className="text-2xl font-black text-white">{branches.filter(b => b.country === 'OM').length}</p>
                        <p className="text-[11px] font-bold text-zinc-500">Oman</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl px-5 py-3 flex items-center gap-3">
                        <p className="text-2xl font-black text-white">{branches.filter(b => b.country === 'AE').length}</p>
                        <p className="text-[11px] font-bold text-zinc-500">UAE</p>
                    </div>
                </div>
                <button onClick={openAdd}
                    className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand/80 text-black text-[13px] font-black flex items-center gap-1.5 transition-colors">
                    <span className="material-icons text-[16px]">add</span>
                    {isRtl ? 'إضافة فرع' : 'Add Branch'}
                </button>
            </div>


            {/* ── Branch List ── */}
            <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.15em]">
                            {branches.length} {isRtl ? 'فروع' : 'locations'}
                        </p>
                    </div>
                    <button onClick={() => { if (window.confirm('Reset all branches?')) resetBranches(); }}
                        className="text-[10px] font-bold text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1">
                        <span className="material-icons text-[13px]">restore</span>
                        {isRtl ? 'إعادة ضبط' : 'Reset'}
                    </button>
                </div>

                {branches.length === 0 && (
                    <div className="px-5 py-10 text-center text-zinc-600">
                        <span className="material-icons text-[36px] block mb-2">location_off</span>
                        <p className="text-[12px]">{isRtl ? 'لا توجد فروع' : 'No branches found'}</p>
                    </div>
                )}

                <div className="divide-y divide-white/4">
                    {branches.map(b => {
                        const meta = TYPE_META[b.type] || TYPE_META.branch;
                        return (
                            <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors group">
                                {/* Icon / Image */}
                                {b.image ? (
                                    <img src={b.image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10" />
                                ) : (
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                                        <span className="material-icons text-[18px]">{meta.icon}</span>
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-[14px] truncate" dir={isRtl ? 'rtl' : 'ltr'}>
                                        {isRtl ? (b.nameAr || b.nameEn) : (b.nameEn || b.nameAr)}
                                    </p>
                                    <p className="text-[11px] text-zinc-600 truncate" dir={isRtl ? 'rtl' : 'ltr'}>{b.address}</p>
                                </div>

                                {/* Badges */}
                                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${meta.color}`}>{b.type}</span>
                                    <span className="text-[10px] text-zinc-600 font-mono">{b.phone}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button onClick={() => openEdit(b)}
                                        className="w-8 h-8 rounded-lg bg-brand/10 hover:bg-brand/20 flex items-center justify-center text-brand transition-colors">
                                        <span className="material-icons text-[15px]">edit</span>
                                    </button>
                                    <button onClick={() => { if (window.confirm('Delete branch?')) deleteBranch(b.id); }}
                                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                                        <span className="material-icons text-[15px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Add/Edit Modal ── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="bg-[#18181b] border border-white/8 rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/6 shrink-0">
                            <div className="flex flex-col gap-0.5">
                                <h2 className="text-[16px] font-black text-white flex items-center gap-2">
                                    <span className="material-icons text-brand text-[18px]">
                                        {modal.mode === 'add' ? 'add_location' : 'edit_location'}
                                    </span>
                                    {modal.mode === 'add' ? (isRtl ? 'إضافة فرع جديد' : 'Add New Branch') : (isRtl ? 'تعديل الفرع' : 'Edit Branch')}
                                </h2>
                                {translating && (
                                    <span className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold animate-pulse">
                                        <span className="material-icons text-[12px]">sync</span> Translating…
                                    </span>
                                )}
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                                <span className="material-icons text-[18px]">close</span>
                            </button>
                        </div>

                        {/* Form */}
                        <div className="overflow-y-auto p-5 flex flex-col gap-4">
                            {/* ... (Country + Type unchanged) */}

                            {/* Names */}
                            <div className="flex flex-col gap-4">
                                {lang === 'en' ? (
                                    <div>
                                        <p className={lbl}>Name (English)</p>
                                        <input type="text" dir="ltr" value={form.nameEn}
                                            onChange={e => setFormField('nameEn', e.target.value)}
                                            placeholder="e.g. Muscat – Head Office"
                                            className={inp} />
                                    </div>
                                ) : (
                                    <div>
                                        <p className={lbl}>الاسم (عربي)</p>
                                        <input type="text" dir="rtl" value={form.nameAr}
                                            onChange={e => setFormField('nameAr', e.target.value)}
                                            placeholder="مثال: مسقط – المقر الرئيسي"
                                            className={inp} />
                                    </div>
                                )}
                            </div>

                            {/* Image Upload */}
                            <div className="flex flex-col gap-2">
                                <p className={lbl}>{isRtl ? 'صورة الفرع' : 'Branch Image'}</p>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative aspect-video rounded-xl bg-[#0f0f12] border-2 border-dashed border-white/10 hover:border-brand/40 overflow-hidden cursor-pointer group transition-colors"
                                >
                                    {form.image ? (
                                        <>
                                            <img src={form.image} className="w-full h-full object-cover" alt="" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="material-icons text-white">cloud_upload</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 gap-1.5">
                                            <span className="material-icons text-[28px]">add_a_photo</span>
                                            <span className="text-[11px] font-bold uppercase tracking-tight">{isRtl ? 'اضغط للرفع' : 'Click to Upload'}</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                {form.image && (
                                    <button onClick={() => setForm(f => ({ ...f, image: '' }))} className="text-[10px] text-red-400 font-bold self-start mt-1 hover:underline">
                                        {isRtl ? 'إزالة الصورة' : 'Remove Image'}
                                    </button>
                                )}
                            </div>

                            {/* Hours */}
                            <div className="flex flex-col gap-4">
                                {lang === 'en' ? (
                                    <div>
                                        <p className={lbl}>Hours (English)</p>
                                        <input type="text" dir="ltr" value={form.hoursEn}
                                            onChange={e => setFormField('hoursEn', e.target.value)}
                                            placeholder="e.g. 8:00 AM - 10:00 PM"
                                            className={inp} />
                                    </div>
                                ) : (
                                    <div>
                                        <p className={lbl}>ساعات العمل (عربي)</p>
                                        <input type="text" dir="rtl" value={form.hoursAr}
                                            onChange={e => setFormField('hoursAr', e.target.value)}
                                            placeholder="مثال: 8:00 صباحاً - 10:00 مساءً"
                                            className={inp} />
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <p className={lbl}>{isRtl ? 'العنوان' : 'Address'}</p>
                                <input type="text" value={form.address}
                                    onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setError(''); }}
                                    placeholder="e.g. Al Majaz Area, Sharjah, UAE"
                                    className={inp} />
                            </div>

                            {/* Phone */}
                            <div>
                                <p className={lbl}>{isRtl ? 'الهاتف' : 'Phone'}</p>
                                <input type="tel" dir="ltr" value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="+968 2684 5084"
                                    className={inp} />
                            </div>

                            {/* Map URL */}
                            <div>
                                <p className={lbl}>{isRtl ? 'رابط الخريطة (اختياري)' : 'Google Maps URL (optional)'}</p>
                                <input type="url" dir="ltr" value={form.mapUrl}
                                    onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))}
                                    placeholder="https://maps.google.com/..."
                                    className={inp} />
                            </div>

                            {error && <p className="text-[12px] text-red-400 font-semibold">{error}</p>}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-2 p-5 border-t border-white/6 shrink-0">
                            <button onClick={closeModal}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 text-[13px] font-bold transition-colors">
                                {isRtl ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button onClick={handleSave}
                                className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand/80 text-black text-[13px] font-black transition-colors flex items-center justify-center gap-1.5">
                                <span className="material-icons text-[15px]">save</span>
                                {isRtl ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
