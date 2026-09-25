import { memo } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { Button } from './ui/Button.jsx';
export default memo(function Hero() {
    const { heroSettings } = useAdmin();
    const { t, lang } = useLang();
    const isRtl = t.dir === 'rtl';

    const isVideo = heroSettings?.type === 'video';
    const src = heroSettings?.src || '';

    return (
        <section className="relative w-full min-h-screen flex items-center overflow-hidden">
            {/* Background */}
            {isVideo && src ? (
                <video
                    key={src}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay muted loop playsInline
                    preload="auto"
                    fetchPriority="high"
                >
                    <source src={src} type="video/mp4" />
                </video>
            ) : src ? (
                <img src={src} alt="Hero" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
                <div className="hero-animated-bg absolute inset-0 w-full h-full" />
            )}

            {/* Decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="shape shape-1" />
                <div className="shape shape-2" />
                <div className="shape shape-3" />
                <div className="shape shape-4" />
            </div>

            {/* Light overlay — keeps text readable without blocking the video */}
            <div className="absolute inset-0 bg-black/35" />

            {/* Content */}
            <div
                className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 pt-28 sm:pt-36 pb-16 sm:pb-20"
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                <div className="max-w-3xl">
                    {/* Tag line */}
                    {(heroSettings?.tag?.[lang] || t.hero.tag) && (
                        <div className="hero-content-animate flex items-center gap-3 mb-4 sm:mb-5">
                            <span className="inline-flex h-px w-8 sm:w-10 bg-brand" />
                            <span className="text-brand text-[10px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase">
                                {heroSettings?.tag?.[lang] || t.hero.tag}
                            </span>
                        </div>
                    )}

                    {/* Headline */}
                    <h1 className="hero-content-animate-delay font-black text-white leading-[1.2] mb-4 sm:mb-5 drop-shadow-md"
                        style={{ fontSize: 'clamp(1.65rem, 4.5vw, 3.25rem)' }}>
                        {heroSettings?.title1?.[lang] || t.hero.title1}
                        <br />
                        <span className="text-brand">{heroSettings?.title2?.[lang] || t.hero.title2}</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-content-animate-delay text-white/75 leading-relaxed mb-8 sm:mb-10"
                        style={{ fontSize: 'clamp(0.825rem, 1.6vw, 1.0625rem)', maxWidth: '36rem' }}>
                        {heroSettings?.subtitle?.[lang] || t.hero.subtitle}
                    </p>

                    {/* CTA */}
                    <div className="hero-content-animate-delay">
                        <Button 
                            href="#/products" 
                            Icon="grid_view"
                            className="px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm"
                        >
                            {t.hero.btnBrowse}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
});
