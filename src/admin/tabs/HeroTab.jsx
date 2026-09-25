import { useState, useEffect, useRef, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import { useAutoTranslate } from '../hooks/useAutoTranslate.js';

const fileToBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
});

const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
};

export default function HeroTab() {
    const { heroSettings, updateHeroSettings, resetHero } = useAdmin();
    const { t, lang } = useLang();
    const isAr = lang === 'ar';
    const [form, setForm]         = useState(heroSettings);
    const [saved, setSaved]       = useState(false);
    const [previewKey, setPreviewKey] = useState(0);
    const [inputMode, setInputMode]   = useState('file'); // 'file' | 'url'
    const [fileInfo, setFileInfo]     = useState(null);
    const fileInputRef = useRef(null);
    const { translating, triggerTranslate } = useAutoTranslate({ delay: 600 });

    useEffect(() => { setForm(heroSettings); }, [heroSettings]);

    const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleMultiLangChange = (field, l, val) => {
        setForm(f => ({
            ...f,
            [field]: { ...f[field], [l]: val }
        }));

        triggerTranslate(val, l, (update) => {
            setForm(f => {
                const currentField = f[field] || {};
                const res = typeof update === 'function' ? update(currentField) : update;
                return {
                    ...f,
                    [field]: { ...currentField, ...res }
                };
            });
        });
    };

    const handleSave = () => {
        updateHeroSettings(form);
        setSaved(true);
        setPreviewKey(k => k + 1);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileInfo({ name: file.name, size: formatBytes(file.size), type: file.type });
        if (file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            setField('src', url);
            setField('type', 'video');
        } else {
            const b64 = await fileToBase64(file);
            setField('src', b64);
            setField('type', 'image');
        }
        setPreviewKey(k => k + 1);
        e.target.value = '';
    }, []);

    const isVideo = form.type === 'video';

    const renderMultiLangField = (field, label) => (
        <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/7 bg-white/2 flex items-center justify-between">
                <h3 className="text-[12px] font-black text-zinc-400 uppercase tracking-wider">{label}</h3>
                {translating && <span className="material-icons text-[14px] text-brand animate-spin">sync</span>}
            </div>
            <div className={`p-4 flex flex-col gap-3`}>
                {lang === 'en' ? (
                    <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">English</span>
                        <input
                            type="text"
                            value={form[field]?.en || ''}
                            onChange={e => handleMultiLangChange(field, 'en', e.target.value)}
                            placeholder="English text..."
                            className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-brand/40 transition-colors"
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">العربية</span>
                        <input
                            type="text"
                            dir="rtl"
                            value={form[field]?.ar || ''}
                            onChange={e => handleMultiLangChange(field, 'ar', e.target.value)}
                            placeholder="النص العربي..."
                            className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-brand/40 transition-colors text-right"
                        />
                    </div>
                )}
            </div>
        </div>
    );

    const inputCls = 'w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-brand/60 transition-colors';

    return (
        <div className="max-w-3xl flex flex-col gap-5 pb-10">

            {/* ── Background settings ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-white/7">
                        <h2 className="text-[14px] font-black text-white">Background Type</h2>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3 flex-1">
                        {[
                            { type: 'video', icon: 'videocam',   label: 'Video' },
                            { type: 'image', icon: 'image',      label: 'Image' },
                        ].map(opt => (
                            <button key={opt.type} onClick={() => setField('type', opt.type)}
                                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all duration-200 ${form.type === opt.type ? 'border-brand bg-brand/10 text-brand' : 'border-white/8 bg-white/2 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}>
                                <span className="material-icons text-[24px]">{opt.icon}</span>
                                <span className="text-[12px] font-black">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/7">
                        <h2 className="text-[14px] font-black text-white">Media Source</h2>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        <div className="flex bg-[#0f0f12] border border-white/8 rounded-xl p-1 gap-1">
                            <button type="button" onClick={() => setInputMode('file')}
                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${inputMode === 'file' ? 'bg-brand text-black' : 'text-zinc-500 hover:text-white'}`}>
                                Browse
                            </button>
                            <button type="button" onClick={() => setInputMode('url')}
                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${inputMode === 'url' ? 'bg-brand text-black' : 'text-zinc-500 hover:text-white'}`}>
                                URL
                            </button>
                        </div>
                        {inputMode === 'file' ? (
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 border-2 border-dashed border-white/10 hover:border-brand/40 rounded-xl px-4 py-3 transition-colors group">
                                <span className="material-icons text-zinc-600 group-hover:text-brand transition-colors">cloud_upload</span>
                                <span className="text-[12px] text-zinc-500 font-bold">Upload File...</span>
                                {fileInfo && <span className="material-icons text-brand text-[16px] ml-auto">check_circle</span>}
                            </button>
                        ) : (
                            <input type="text" value={form.src?.startsWith('data:') || form.src?.startsWith('blob:') ? '' : form.src}
                                onChange={e => { setField('src', e.target.value); setFileInfo(null); }}
                                placeholder={isVideo ? '/Assets/Video/bg.mp4' : 'https://...'} className={`${inputCls} py-2.5 px-3`} />
                        )}
                        <input ref={fileInputRef} type="file" accept={isVideo ? 'video/*' : 'image/*'} className="hidden" onChange={handleFileChange} />
                    </div>
                </div>
            </div>

            {/* ── Content settings ── */}
            <div className="space-y-4">
                {renderMultiLangField('tag', 'Tag line')}
                {renderMultiLangField('title1', 'Headline Line 1')}
                {renderMultiLangField('title2', 'Headline Line 2 (Colored)')}
                <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/7 bg-white/2 flex items-center justify-between">
                        <h3 className="text-[12px] font-black text-zinc-400 uppercase tracking-wider">Subtitle / Description</h3>
                        {translating && <span className="material-icons text-[14px] text-brand animate-spin">sync</span>}
                    </div>
                    <div className={`p-4 flex flex-col gap-4`}>
                        {lang === 'en' ? (
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-zinc-600 font-bold uppercase">English</span>
                                <textarea
                                    value={form.subtitle?.en || ''}
                                    onChange={e => handleMultiLangChange('subtitle', 'en', e.target.value)}
                                    rows={3}
                                    className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-brand/40 transition-colors resize-none"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-zinc-600 font-bold uppercase">العربية</span>
                                <textarea
                                    dir="rtl"
                                    value={form.subtitle?.ar || ''}
                                    onChange={e => handleMultiLangChange('subtitle', 'ar', e.target.value)}
                                    rows={3}
                                    className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-brand/40 transition-colors text-right resize-none"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center gap-3 pt-2">
                <button
                    onClick={handleSave}
                    disabled={translating}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[13px] font-black transition-all duration-300 ${saved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-brand hover:bg-brand/80 text-black shadow-lg shadow-brand/20'} ${translating && 'opacity-50 cursor-not-allowed'}`}
                >
                    <span className="material-icons text-[18px]">{saved ? 'check_circle' : 'save'}</span>
                    {saved ? 'Saved!' : 'Apply Hero Changes'}
                </button>
                <button
                    onClick={() => { resetHero(); setFileInfo(null); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-[13px] font-bold text-zinc-400 hover:text-white transition-colors"
                >
                    <span className="material-icons text-[18px]">restart_alt</span>
                    Reset
                </button>
            </div>
        </div>
    );
}
