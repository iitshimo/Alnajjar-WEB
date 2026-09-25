import { useAutoTranslate } from '../hooks/useAutoTranslate.js';
import { useLang } from '../../context/LanguageContext.jsx';

export const LANGS = ['ar', 'en', 'ur', 'zh', 'ru'];
export const LANG_META = {
    ar: { label: 'Arabic', dir: 'rtl' },
    en: { label: 'English', dir: 'ltr' },
    ur: { label: 'Urdu', dir: 'rtl' },
    zh: { label: 'Chinese', dir: 'ltr' },
    ru: { label: 'Russian', dir: 'ltr' },
};

export default function MultiLangField({ label, values, onChange, multiline = false }) {
    const { lang: currentLang } = useLang();
    const { translating, transLang, triggerTranslate } = useAutoTranslate({ delay: 600 });

    const sortedLangs = [...LANGS].sort((a, b) => {
        if (a === currentLang) return -1;
        if (b === currentLang) return 1;
        // Keep English/Arabic as secondary priorities if currentLang is neither
        if (currentLang !== 'ar' && currentLang !== 'en') {
            if (a === 'ar') return -1;
            if (b === 'ar') return 1;
            if (a === 'en') return -1;
            if (b === 'en') return 1;
        }
        return 0;
    });

    const handleChange = (lang, val) => {
        onChange({ ...values, [lang]: val });
        triggerTranslate(val, lang, onChange);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{label}</label>
                {translating && (
                    <span className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold animate-pulse">
                        <span className="material-icons text-[12px]">sync</span>
                        Auto-translating from {LANG_META[transLang]?.label}…
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-2">
                {(() => {
                    const lang = currentLang;
                    const meta = LANG_META[lang] || LANG_META['en'];
                    const isSource = lang === 'ar' || lang === 'en';
                    const cls = `flex-1 bg-[#111113] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-brand/40 transition-colors`;
                    
                    return (
                        <div className="flex items-start gap-3">
                            <div className="flex items-center gap-1.5 w-24 shrink-0 pt-2.5">
                                <span className={`text-[11px] font-bold ${isSource ? 'text-brand' : 'text-zinc-500'}`}>
                                    {meta.label}
                                </span>
                            </div>
                            {multiline
                                ? <textarea rows={3} value={values?.[lang] || ''} onChange={e => handleChange(lang, e.target.value)} dir={meta.dir} className={cls + ' resize-y'} />
                                : <input type="text" value={values?.[lang] || ''} onChange={e => handleChange(lang, e.target.value)} dir={meta.dir} className={cls} />
                            }
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
