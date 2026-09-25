import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import { useAutoTranslate } from '../hooks/useAutoTranslate.js';

export default function CategoriesTab() {
    const { categories, addCategory, deleteCategory, resetCategories } = useAdmin();
    const { t, lang } = useLang();
    const isAr = lang === 'ar';
    const [newNameEn, setNewNameEn] = useState('');
    const [newNameAr, setNewNameAr] = useState('');
    const [error, setError] = useState('');
    const { translating, triggerTranslate } = useAutoTranslate({ delay: 600 });

    const handleFieldChange = (l, val) => {
        if (l === 'en') setNewNameEn(val);
        else setNewNameAr(val);
        setError('');

        triggerTranslate(val, l, (update) => {
            const res = typeof update === 'function' ? update({}) : update;
            if (res.ar && l === 'en') setNewNameAr(res.ar);
            if (res.en && l === 'ar') setNewNameEn(res.en);
        });
    };

    const handleAdd = async () => {
        const titleEn = newNameEn.trim();
        const titleAr = newNameAr.trim();
        
        if (!titleEn && !titleAr) { setError(t.admin.categories.nameEnglish + ' ?'); return; }

        if (categories.some(c => 
            (titleEn && c.label.en?.toLowerCase() === titleEn.toLowerCase()) ||
            (titleAr && c.label.ar === titleAr)
        )) {
            setError('Exists!');
            return;
        }

        const labels = { en: titleEn, ar: titleAr };
        addCategory(labels);
        setNewNameEn('');
        setNewNameAr('');
        setError('');
    };

    const inputPair = (code, label, val, dir, placeholder) => (
        <div className="flex-1 flex flex-col gap-1.5 min-w-[200px]">
            <span className="text-[10px] text-zinc-600 font-semibold flex items-center gap-1.5">
                {label}
                {translating && <span className="material-icons text-[11px] text-zinc-600 animate-spin">sync</span>}
            </span>
            <div className="flex items-center gap-2 bg-[#0f0f12] border border-white/10 rounded-xl px-3 py-2.5">
                <span className="text-brand text-[12px] font-black uppercase">{code.toUpperCase()}</span>
                <input
                    type="text"
                    value={val}
                    onChange={e => handleFieldChange(code, e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-[13px] text-white focus:outline-none placeholder:text-zinc-700"
                    dir={dir}
                />
            </div>
        </div>
    );

    return (
        <>
            {/* ── Header stats ── */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-white/6 rounded-2xl px-5 py-3 flex items-center gap-3">
                    <p className="text-2xl font-black text-white">{categories.length}</p>
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{t.admin.categories.totalCategories}</p>
                </div>
            </div>

            {/* ── Add Category ── */}
            <div className="bg-[#18181b] border border-white/7 rounded-2xl p-5 mb-5">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">{t.admin.categories.addNewCategory}</p>

                <div className="flex flex-col gap-3 w-full max-w-2xl">
                    <div className="flex flex-col gap-3">
                        {lang === 'en' 
                            ? inputPair('en', t.admin.categories.nameEnglish, newNameEn, 'ltr', 'e.g. Outdoor Tiles…')
                            : inputPair('ar', t.admin.categories.nameArabic, newNameAr, 'rtl', 'مثال: الواح خشبية...')
                        }
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex-1">
                            {error && <p className="text-[11px] text-red-400">{error}</p>}
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={translating}
                            className={`px-5 py-2.5 rounded-xl text-[13px] font-black text-black transition-colors flex items-center justify-center gap-1.5 shrink-0 ${translating ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:bg-brand/80'}`}
                        >
                            <span className={`material-icons text-[16px] ${translating && 'animate-spin'}`}>
                                {translating ? 'sync' : 'add'}
                            </span>
                            {translating ? t.admin.categories.translating : t.admin.categories.add}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Active Categories ── */}
            <div className="bg-[#18181b] border border-white/6 rounded-2xl overflow-hidden mb-5">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.15em]">{t.admin.sidebar.categories}</p>
                    </div>
                    <button
                        onClick={() => { if (window.confirm(t.admin.categories.confirmReset)) resetCategories(); }}
                        className="text-[10px] font-bold text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                        <span className="material-icons text-[13px]">restore</span> {t.admin.categories.reset}
                    </button>
                </div>

                {categories.length === 0 && (
                    <div className="px-5 py-10 text-center text-zinc-600">
                        <span className="material-icons text-[36px] block mb-2">category</span>
                        <p className="text-[12px]">{t.admin.categories.noCategories}</p>
                    </div>
                )}

                <div className="divide-y divide-white/4">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors group">
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-[14px]" dir={isAr ? 'rtl' : 'ltr'}>
                                    {isAr ? (cat.label.ar || cat.label.en) : (cat.label.en || cat.label.ar)}
                                </p>
                            </div>

                            {/* ID badge */}
                            <span className="hidden sm:flex px-2 py-0.5 rounded-md bg-white/4 text-zinc-600 text-[10px] font-mono">{cat.id}</span>

                            {/* Delete */}
                            <button
                                onClick={() => deleteCategory(cat.id)}
                                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                                title={t.admin.categories.delete}
                            >
                                <span className="material-icons text-[16px]">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
