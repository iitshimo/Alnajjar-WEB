import { useState, useEffect, useRef, memo } from 'react';
import { useLang } from '../context/LanguageContext.jsx';

const navIds = ['home', 'products', 'about', 'branches', 'contact'];

const navHref = (id) => {
    if (id === 'home') return '#/home';
    return `#/${id}`;
};

export default memo(function Header({ currentPage = 'home', setPage }) {
    const { t, lang, setLang, languages, currentLangMeta, currency, setCurrency, currencies, currentCurrencyMeta } = useLang();
    const isRtl = t.dir === 'rtl';
    const [menuOpen, setMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [currOpen, setCurrOpen] = useState(false);
    const langRef = useRef(null);
    const currRef = useRef(null);

    useEffect(() => {
        setMenuOpen(false);
        setLangOpen(false);
    }, [currentPage]);

    useEffect(() => {
        const handler = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
            if (currRef.current && !currRef.current.contains(e.target)) setCurrOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="fixed top-0 left-0 w-full z-50 transition-colors duration-300" style={{ background: '#f8f7f5', borderBottom: '1px solid #ede9e3' }}>
            <style>{`
                @keyframes header-fadein { from{opacity:0} to{opacity:1} }
            `}</style>

            <div className="h-18 lg:h-22 flex items-center justify-between px-4 sm:px-10 lg:px-16 max-w-[1920px] mx-auto relative z-110">

                {/* Left: Logo + Desktop Nav */}
                <div className="flex-1 flex items-center gap-10 xl:gap-16 min-w-0">
                    <a href="#/home" className="shrink-0 relative group">
                        <div className="absolute inset-0 bg-brand/10 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 ease-out" />
                        <img src="/Assets/Logo/logo.png" alt="Al Najjar" fetchPriority="high" className="h-10 sm:h-12 lg:h-14 w-auto object-contain relative z-10 drop-shadow-sm" />
                    </a>

                    <nav className="hidden lg:flex items-center gap-8 xl:gap-10 shrink-0">
                        {navIds.map((id) => {
                            const isActive = id === currentPage;
                            return (
                                <a
                                    key={id}
                                    href={navHref(id)}
                                    className={`group relative font-bold text-[13px] tracking-wider uppercase py-2 whitespace-nowrap transition-all duration-300 ${isActive ? 'text-brand' : 'text-zinc-600 hover:text-brand'}`}
                                >
                                    {t.nav[id]}
                                    <span className={`absolute bottom-0 left-0 h-[2px] bg-brand rounded-full transition-all duration-300 ease-out ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`} />
                                </a>
                            );
                        })}
                    </nav>
                </div>

                {/* Right: Language + Currency + Hamburger */}
                <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0">
                        <div className="flex items-center gap-2 sm:gap-4" style={{ animation: 'header-fadein 0.4s ease both' }}>

                            {/* Language Switcher */}
                            <div className="relative shrink-0" ref={langRef}>
                                <button
                                    onClick={() => setLangOpen(v => !v)}
                                    className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] font-extrabold text-[#333333] hover:text-brand bg-white rounded-full px-4 sm:px-5 h-[40px] sm:h-[44px] select-none shadow-[0_2px_10px_rgba(0,0,0,0.04)] uppercase tracking-wider"
                                    aria-label="Select language"
                                >
                                    <span className="material-icons text-[16px] leading-none text-brand">language</span>
                                    <span className="hidden sm:inline truncate max-w-[80px]">{currentLangMeta?.label}</span>
                                    <span className="sm:hidden">{currentLangMeta?.nativeShort}</span>
                                    <span className={`material-icons text-[14px] text-zinc-400 transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>
                                <div
                                    className={`absolute top-[calc(100%+12px)] bg-[#f9fafb] rounded-[1.25rem] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white py-2.5 min-w-[180px] z-50 transition-all duration-300 ${langOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 translate-y-2 invisible'}`}
                                    style={{ [isRtl ? 'left' : 'right']: 0, transformOrigin: isRtl ? 'top left' : 'top right' }}
                                >
                                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-400 px-5 pt-3 pb-3">Select Language</p>
                                    <div className="px-2">
                                        {languages.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => { setLang(l.code); setLangOpen(false); }}
                                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[14px] transition-all duration-200 mb-1 last:mb-0 ${lang === l.code ? 'bg-brand text-white shadow-md font-bold' : 'text-[#555] font-medium hover:bg-white hover:shadow-sm hover:text-brand'}`}
                                            >
                                                <div className="flex items-center gap-2.5" dir={l.dir}>
                                                    <span className={`material-icons text-[16px] ${lang === l.code ? 'text-white' : 'text-brand'}`}>language</span>
                                                    <span className="tracking-wide">{l.label}</span>
                                                </div>
                                                {lang === l.code && <span className="material-icons text-[18px] text-white">check_circle</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Currency Switcher */}
                            <div className="relative shrink-0" ref={currRef}>
                                <button
                                    onClick={() => setCurrOpen(v => !v)}
                                    className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] font-extrabold text-[#333333] hover:text-brand bg-white rounded-full px-3 sm:px-5 h-[40px] sm:h-[44px] select-none shadow-[0_2px_10px_rgba(0,0,0,0.04)] uppercase tracking-wider"
                                    aria-label="Select currency"
                                >
                                    <span className="text-[15px] leading-none text-brand font-black">{currentCurrencyMeta?.symbol}</span>
                                    <span className="hidden sm:inline truncate max-w-[80px] font-black">{currentCurrencyMeta?.code}</span>
                                    <span className={`material-icons text-[14px] text-zinc-400 transition-transform duration-300 ${currOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>
                                <div
                                    className={`absolute top-[calc(100%+12px)] bg-[#f9fafb] rounded-[1.25rem] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white py-2.5 min-w-[180px] z-50 transition-all duration-300 ${currOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 translate-y-2 invisible'}`}
                                    style={{ [isRtl ? 'left' : 'right']: 0, transformOrigin: isRtl ? 'top left' : 'top right' }}
                                >
                                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-400 px-5 pt-3 pb-3">Select Currency</p>
                                    <div className="px-2">
                                        {currencies.map((c) => {
                                            const isSelected = currency === c.code;
                                            return (
                                                <button
                                                    key={c.code}
                                                    onClick={() => { setCurrency(c.code); setCurrOpen(false); }}
                                                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[14px] transition-all duration-200 mb-1 last:mb-0 ${isSelected ? 'bg-brand text-white shadow-md font-bold' : 'text-[#555] font-medium hover:bg-white hover:shadow-sm hover:text-brand'}`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`text-[16px] font-black ${isSelected ? 'text-white' : 'text-[#333]'}`}>{c.symbol}</span>
                                                        <span className="tracking-wide">{c.code}</span>
                                                    </div>
                                                    {isSelected && <span className="material-icons text-[18px] text-white">check_circle</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Hamburger */}
                            <button
                                onClick={() => setMenuOpen(v => !v)}
                                className="lg:hidden flex items-center justify-center w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full bg-white text-zinc-600 hover:text-brand transition-colors shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)]"
                                aria-label="Toggle menu"
                            >
                                <span className="material-icons text-[20px]">{menuOpen ? 'close' : 'segment'}</span>
                            </button>
                        </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                style={{ background: '#f8f7f5', borderColor: '#ede9e3' }}
                className={`lg:hidden border-b overflow-hidden transition-all duration-400 ease-out origin-top ${menuOpen ? 'max-h-[500px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95'}`}
            >
                <nav className="flex flex-col px-6 py-5 gap-2.5">
                    {navIds.map((id) => {
                        const isActive = id === currentPage;
                        return (
                            <a
                                key={id}
                                href={navHref(id)}
                                onClick={() => setMenuOpen(false)}
                                className={`font-semibold py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center justify-between group shadow-sm text-[14px] tracking-wide uppercase ${isActive ? 'bg-brand text-white shadow-md' : 'bg-zinc-50/80 text-zinc-600 hover:bg-[#fef9ef] hover:text-brand border border-zinc-200/50 hover:border-brand/30'}`}
                            >
                                <span>{t.nav[id]}</span>
                                {isActive && <span className="material-icons text-white text-[20px]">chevron_right</span>}
                                {!isActive && <span className="material-icons text-brand text-[20px] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0">arrow_forward</span>}
                            </a>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
});
