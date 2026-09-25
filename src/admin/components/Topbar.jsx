import { memo, useState, useRef, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext.jsx';
import { TABS } from '../utils/constants.js';

export default memo(function Topbar({ activeTab, setMobileOpen }) {
    const activeTabMeta = TABS.find(t => t.id === activeTab);
    const { t, lang, setLang, languages } = useLang();
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langRef.current && !langRef.current.contains(event.target)) setLangOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="h-14 flex items-center gap-3 px-4 sm:px-5 border-b border-white/6 bg-[#141418] shrink-0">
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0"
                aria-label="Open menu"
            >
                <span className="material-icons text-[22px]">menu</span>
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-zinc-700 text-[12px] font-semibold hidden sm:inline">{t.admin.sidebar.adminPortal}</span>
                <span className="text-zinc-700 hidden sm:inline">/</span>
                <div className="flex items-center gap-1.5">
                    <span className="material-icons text-brand text-[16px]">{activeTabMeta?.icon}</span>
                    <h1 className="text-[14px] font-black text-white truncate">{activeTabMeta ? (t.admin.sidebar[activeTabMeta.id] || activeTabMeta.label) : ''}</h1>
                </div>
            </div>

            {/* Language Switcher */}
            <div className="relative border-r rtl:border-r-0 rtl:border-l border-white/6 pr-4 rtl:pr-0 rtl:pl-4 mr-2 rtl:mr-0 rtl:ml-2" ref={langRef}>
                <button 
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white transition-all text-[12px] font-bold shadow-sm"
                >
                    <span className="material-icons text-[14px] text-brand">language</span>
                    <span className="uppercase tracking-wider">{lang}</span>
                    <span className="material-icons text-[16px] text-zinc-500 transition-transform duration-300" style={{ transform: langOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
                </button>
                
                {langOpen && (
                    <div className="absolute top-full right-4 rtl:right-auto rtl:left-4 mt-2 w-36 bg-[#18181b] border border-white/8 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden flex flex-col origin-top animate-in fade-in slide-in-from-top-2 duration-200">
                        {languages.filter(l => ['ar', 'en'].includes(l.code)).map(l => (
                            <button
                                key={l.code}
                                onClick={() => { setLang(l.code); setLangOpen(false); }}
                                className={`flex items-center justify-between px-4 py-2.5 text-[12px] font-bold transition-all text-left rtl:text-right ${lang === l.code ? 'bg-brand/10 text-brand' : 'text-zinc-400 hover:bg-white/4 hover:text-white hover:pl-5 rtl:hover:pl-4 rtl:hover:pr-5'}`}
                                dir={l.dir}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{l.label}</span>
                                </div>
                                {lang === l.code && <span className="material-icons text-[14px] text-brand">check_circle</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-colors shrink-0"
            >
                <span className="material-icons text-[15px]">open_in_new</span>
                <span className="hidden sm:inline">{t.nav.home}</span>
            </a>
        </header>
    );
});
