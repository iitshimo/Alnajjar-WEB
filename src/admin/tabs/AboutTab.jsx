import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import { useAutoTranslate } from '../hooks/useAutoTranslate.js';
import MultiLangField, { LANGS } from '../components/MultiLangField.jsx';

export default function AboutTab() {
    const { aboutContent, updateAboutContent, resetAbout } = useAdmin();
    const { t, lang } = useLang();
    const isAr = lang === 'ar';
    const [form, setForm] = useState(aboutContent);
    const [saved, setSaved] = useState(false);
    const { translating, triggerTranslate } = useAutoTranslate({ delay: 600 });

    useEffect(() => { setForm(aboutContent); }, [aboutContent]);

    const setTitle = (vals) => setForm(f => typeof vals === 'function' ? { ...f, title: vals(f.title) } : { ...f, title: vals });
    const setDesc = (vals) => setForm(f => typeof vals === 'function' ? { ...f, description: vals(f.description) } : { ...f, description: vals });

    const setStatField = (i, field, val) => setForm(f => {
        const stats = [...f.stats]; stats[i] = { ...stats[i], [field]: val }; return { ...f, stats };
    });

    const setStatLabel = (i, l, val) => {
        setForm(f => {
            const stats = [...(f.stats || [])];
            const stat = { ...stats[i] };
            stat.labels = { ...(stat.labels || {}), [l]: val };
            stats[i] = stat;
            return { ...f, stats };
        });

        triggerTranslate(val, l, (update) => {
            setForm(f => {
                const stats = [...(f.stats || [])];
                const stat = { ...stats[i] };
                const currentLabels = stat.labels || {};
                const res = typeof update === 'function' ? update(currentLabels) : update;
                stat.labels = { ...currentLabels, ...res };
                stats[i] = stat;
                return { ...f, stats };
            });
        });
    };

    const addStat = () => setForm(f => ({ ...f, stats: [...(f.stats || []), { value: '0', suffix: '+', labels: { ar: '', en: '' } }] }));
    const removeStat = (i) => setForm(f => ({ ...f, stats: f.stats.filter((_, idx) => idx !== i) }));

    const handleSave = () => {
        updateAboutContent(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="max-w-3xl flex flex-col gap-6 pb-10">
            {/* Title */}
            <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-white/7 flex items-center justify-between">
                    <h2 className="text-[14px] font-black text-white">Company Title</h2>
                </div>
                <div className="p-5">
                    <MultiLangField label="Displayed as main heading" values={form.title} onChange={setTitle} />
                </div>
            </div>

            {/* Description */}
            <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-white/7 flex items-center justify-between">
                    <h2 className="text-[14px] font-black text-white">Company Description</h2>
                </div>
                <div className="p-5">
                    <MultiLangField label="Introductory paragraph" values={form.description} onChange={setDesc} multiline />
                </div>
            </div>

            {/* Stats */}
            <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-white/7 flex items-center justify-between">
                    <div>
                        <h2 className="text-[14px] font-black text-white">Statistics Highlights</h2>
                        {translating && <span className="text-[10px] text-brand animate-pulse ml-2 font-black uppercase">Translating labels...</span>}
                    </div>
                    <button onClick={addStat} className="flex items-center gap-1 text-[11px] font-black text-brand hover:text-white transition-colors uppercase tracking-tight">
                        <span className="material-icons text-[16px]">add</span> Add Stat
                    </button>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    {(form.stats || []).map((stat, i) => (
                        <div key={i} className="bg-[#111113] rounded-2xl p-4 border border-white/5 flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Statistical Fact {i + 1}</span>
                                <button onClick={() => removeStat(i)} className="w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-colors">
                                    <span className="material-icons text-[14px]">remove_circle</span>
                                </button>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase">Value</label>
                                    <input type="text" value={stat.value} onChange={e => setStatField(i, 'value', e.target.value)} placeholder="e.g. 50" className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2 text-[13px] text-white focus:outline-none focus:border-brand/40" />
                                </div>
                                <div className="flex flex-col gap-1.5 w-24">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase">Suffix</label>
                                    <input type="text" value={stat.suffix} onChange={e => setStatField(i, 'suffix', e.target.value)} placeholder="+" className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2 text-[13px] text-white focus:outline-none focus:border-brand/40" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-tight">Labels (Auto-translated from English/Arabic)</label>
                                </div>
                                <div className={`flex flex-col gap-3`}>
                                    {lang === 'en' ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-bold text-zinc-700 uppercase">English</span>
                                            <input
                                                type="text"
                                                value={stat.labels?.en || ''}
                                                onChange={e => setStatLabel(i, 'en', e.target.value)}
                                                placeholder="Label in English"
                                                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2 text-[12px] text-zinc-300 focus:outline-none focus:border-brand/30"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-bold text-zinc-700 uppercase">العربية</span>
                                            <input
                                                type="text"
                                                dir="rtl"
                                                value={stat.labels?.ar || ''}
                                                onChange={e => setStatLabel(i, 'ar', e.target.value)}
                                                placeholder="التسمية بالعربية"
                                                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2 text-[12px] text-zinc-300 focus:outline-none focus:border-brand/30 text-right"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!form.stats || form.stats.length === 0) && (
                        <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-2">
                            <span className="material-icons text-zinc-700 text-[32px]">bar_chart</span>
                            <p className="text-[11px] text-zinc-600">No statistics added yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={translating}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[13px] font-black transition-all duration-300 ${saved ? 'bg-emerald-500 text-white shadow-lg' : 'bg-brand hover:bg-brand/80 text-black shadow-lg shadow-brand/20'} ${translating && 'opacity-50 cursor-not-allowed'}`}
                >
                    <span className="material-icons text-[18px]">{saved ? 'check_circle' : 'save'}</span>
                    {saved ? 'Saved!' : 'Apply Content Changes'}
                </button>
                <button
                    onClick={() => { resetAbout(); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-[13px] font-bold text-zinc-400 hover:text-white transition-colors"
                >
                    <span className="material-icons text-[18px]">restart_alt</span>
                    Reset Defaults
                </button>
            </div>
        </div>
    );
}
