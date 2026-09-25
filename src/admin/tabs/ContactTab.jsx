import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import { useAutoTranslate } from '../hooks/useAutoTranslate.js';

const FIELDS = [
    { key: 'phone', label: 'Phone Number', icon: 'phone', type: 'tel', placeholder: '+968 XXXX XXXX', dir: 'ltr' },
    { key: 'whatsapp', label: 'WhatsApp Number', icon: 'chat', type: 'tel', placeholder: '+968 XXXX XXXX', dir: 'ltr' },
    { key: 'email', label: 'Email Address', icon: 'email', type: 'email', placeholder: 'contact@example.com', dir: 'ltr' },
    { key: 'addressEn', label: 'Address Text (English)', icon: 'location_on', type: 'text', placeholder: 'Muscat, Oman', dir: 'ltr' },
    { key: 'addressAr', label: 'Address Text (Arabic)', icon: 'location_on', type: 'text', placeholder: 'مسقط، عمان', dir: 'rtl' },
    { key: 'mapUrl', label: 'Map Location URL', icon: 'map', type: 'url', placeholder: 'https://maps.google.com/...', dir: 'ltr' },
];

const SOCIAL_FIELDS = [
    { key: 'tiktok', label: 'TikTok URL', icon: 'smart_display', placeholder: 'https://tiktok.com/@...' },
    { key: 'instagram', label: 'Instagram URL', icon: 'photo_camera', placeholder: 'https://instagram.com/...' },
    { key: 'facebook', label: 'Facebook URL', icon: 'group', placeholder: 'https://facebook.com/...' },
];

export default function ContactTab() {
    const { contactInfo, updateContactInfo, resetContact } = useAdmin();
    const { lang, t } = useLang();
    const [form, setForm] = useState(contactInfo);
    const [saved, setSaved] = useState(false);
    const { translating, triggerTranslate } = useAutoTranslate({ delay: 600 });

    useEffect(() => { setForm(contactInfo); }, [contactInfo]);

    const setField = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        
        if (key === 'addressAr' || key === 'addressEn') {
            const l = key === 'addressAr' ? 'ar' : 'en';
            triggerTranslate(val, l, (update) => {
                setForm(f => {
                    const res = typeof update === 'function' ? update({}) : update;
                    const synced = {};
                    if (res.en && key === 'addressAr') synced.addressEn = res.en;
                    if (res.ar && key === 'addressEn') synced.addressAr = res.ar;
                    return { ...f, ...synced };
                });
            });
        }
    };

    const handleSave = () => {
        updateContactInfo(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="max-w-2xl flex flex-col gap-8 pb-12">
            
            {/* ── Contact Info Card ── */}
            <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-white/7 flex items-center justify-between bg-white/2">
                    <div>
                        <h2 className="text-[15px] font-black text-white">Contact Information</h2>
                        <p className="text-[11px] text-zinc-500">Displayed on the public contact page</p>
                    </div>
                    {translating && (
                        <span className="flex items-center gap-1.5 text-[10px] text-brand font-bold animate-pulse">
                            <span className="material-icons text-[14px]">sync</span> Translating…
                        </span>
                    )}
                </div>
                <div className="p-6 flex flex-col gap-5">
                    {FIELDS.filter(f => {
                        if (f.key === 'addressAr' && lang === 'en') return false;
                        if (f.key === 'addressEn' && lang === 'ar') return false;
                        return true;
                    }).map(({ key, label, icon, type, placeholder, dir }) => (
                        <div key={key} className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                                <span className="material-icons text-[15px] text-zinc-600">{icon}</span>
                                {lang === 'ar' && key === 'addressAr' ? 'العنوان' : label}
                            </label>
                            <input
                                type={type}
                                dir={dir || 'auto'}
                                value={form[key] || ''}
                                onChange={e => setField(key, e.target.value)}
                                placeholder={placeholder}
                                className="bg-[#111113] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-brand/40 transition-colors"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Social Media Card ── */}
            <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-white/7 bg-white/2">
                    <h2 className="text-[15px] font-black text-white">Social Media Links</h2>
                    <p className="text-[11px] text-zinc-500">Used in the "Follow Us" footer section</p>
                </div>
                <div className="p-6 flex flex-col gap-5">
                    {SOCIAL_FIELDS.map(({ key, label, icon, placeholder }) => (
                        <div key={key} className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                                <span className="material-icons text-[15px] text-zinc-600">{icon}</span>
                                {label}
                            </label>
                            <input
                                type="url"
                                value={form[key] || ''}
                                onChange={e => setField(key, e.target.value)}
                                placeholder={placeholder}
                                className="bg-[#111113] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-brand/40 transition-colors"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center gap-3">
                <button onClick={handleSave}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[13px] font-black transition-all duration-300 ${saved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-brand hover:bg-brand/80 text-black shadow-lg shadow-brand/20'}`}>
                    <span className="material-icons text-[20px]">{saved ? 'check_circle' : 'save'}</span>
                    {saved ? 'Saved Successfully!' : 'Apply Contact Changes'}
                </button>
                <button onClick={resetContact}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-[13px] font-bold text-zinc-400 hover:text-white transition-colors border border-white/5">
                    <span className="material-icons text-[20px]">restart_alt</span>
                    Reset
                </button>
            </div>

            {/* ── Preview Card ── */}
            <div className="bg-[#18181b] border border-white/7 rounded-2xl p-6 shadow-sm">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6">Live Site Preview</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { icon: 'phone', color: 'text-brand', val: form.phone, label: 'Call Us' },
                        { icon: 'chat', color: 'text-emerald-400', val: form.whatsapp, label: 'WhatsApp' },
                        { icon: 'email', color: 'text-blue-400', val: form.email, label: 'Email' },
                        { icon: 'location_on', color: 'text-rose-400', val: lang === 'ar' ? form.addressAr : form.addressEn, label: 'Visit Us' },
                    ].map(r => (
                        <div key={r.icon} className="flex items-center gap-4 p-4 bg-white/2 rounded-2xl border border-white/5 hover:bg-white/4 transition-colors">
                            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${r.color} shrink-0`}>
                                <span className="material-icons text-[20px]">{r.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-wider">{r.label}</p>
                                <p className="text-[13px] text-zinc-300 font-bold truncate mt-0.5" dir={r.icon === 'location_on' && lang === 'ar' ? 'rtl' : 'ltr'}>{r.val || '—'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
