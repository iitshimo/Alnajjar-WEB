import { memo, useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useAdmin } from '../context/AdminContext.jsx';
import { Skeleton } from './ui/Skeleton.jsx';
import { PageHeader } from './ui/PageHeader.jsx';

// Animated counter style stat card
const StatCard = ({ value, suffix, label }) => (
    <div className="flex flex-col items-center gap-1 py-6 px-4">
        <p className="text-3xl md:text-4xl font-black text-brand leading-none">
            {value}<span className="text-2xl">{suffix}</span>
        </p>
        <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-widest text-center mt-1">{label}</p>
    </div>
);

// Icon card for vision/mission
const HighlightCard = ({ icon, title, text, accent }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 flex flex-col gap-4 ${accent ? 'bg-brand text-white' : 'bg-white border border-zinc-100 shadow-sm'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-white/20' : 'bg-brand/10'}`}>
            <span className={`material-icons text-[22px] ${accent ? 'text-white' : 'text-brand'}`}>{icon}</span>
        </div>
        <div>
            <h3 className={`font-black text-[15px] mb-2 ${accent ? 'text-white' : 'text-zinc-900'}`}>{title}</h3>
            <p className={`text-sm leading-relaxed ${accent ? 'text-white/85' : 'text-zinc-500'}`}>{text}</p>
        </div>
        {/* subtle decoration */}
        {accent && (
            <div className="absolute -bottom-6 -inset-e-6 w-24 h-24 rounded-full bg-white/10" />
        )}
    </div>
);


export default memo(function About() {
    const { t, lang } = useLang();
    const { aboutContent } = useAdmin();
    const isRtl = t.dir === 'rtl';

    const title = aboutContent?.title?.[lang] || aboutContent?.title?.en || t?.about?.title || '';
    const description = aboutContent?.description?.[lang] || aboutContent?.description?.en || t?.about?.description || '';
    const stats = aboutContent?.stats || [];

    const ab = t?.about || {};
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const id = setTimeout(() => setLoaded(true), 600);
        return () => clearTimeout(id);
    }, []);

    return (
        <section dir={isRtl ? 'rtl' : 'ltr'} className="bg-[#f7f6f4] min-h-screen">
            {/* ── Hero Banner ─────────────────────────────────────────── */}
            <div className="relative w-full overflow-hidden bg-[#111009]" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 opacity-20 grid-overlay" />
                {/* Decorative circles */}
                <div className="absolute -top-20 -inset-e-20 w-72 h-72 rounded-full border border-brand/20" />
                <div className="absolute -bottom-16 -inset-s-16 w-96 h-96 rounded-full border border-brand/10" />
                <div className="absolute top-10 inset-s-1/2 w-48 h-48 rounded-full border border-brand/10" />

                {/* Logo watermark */}
                <img
                    src="/Assets/Logo/logo.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain opacity-[0.04] pointer-events-none"
                    loading="lazy"
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 md:py-28">
                    {!loaded ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <Skeleton className="h-10 w-80 rounded-xl" />
                            <Skeleton className="h-4 w-96 rounded-full" />
                            <Skeleton className="h-4 w-72 rounded-full" />
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight max-w-3xl mb-4">
                                {title}
                            </h1>
                            <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl">
                                {description}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* ── Stats Bar ───────────────────────────────────────────── */}
            {stats.length > 0 && (
                <div className="bg-white border-b border-zinc-100 shadow-sm">
                    <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 rtl:divide-x-reverse">
                        {!loaded ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="flex flex-col items-center gap-2 py-6 px-4">
                                    <Skeleton className="h-8 w-16 rounded-lg" />
                                    <Skeleton className="h-3 w-20 rounded-full" />
                                </div>
                            ))
                        ) : (
                            stats.map((stat, i) => (
                                <StatCard
                                    key={i}
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    label={stat.labels?.[lang] || stat.labels?.en || ''}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ── Vision & Mission ─────────────────────────────────────── */}
            {(ab.visionTitle || ab.missionTitle) && (
                <div className="max-w-6xl mx-auto px-6 sm:px-10 pb-14 pt-12">
                    {!loaded ? (
                        <>
                            <Skeleton className="h-3 w-32 rounded-full mb-8" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {[1, 2].map(i => (
                                    <div key={i} className="rounded-2xl p-6 bg-white border border-zinc-100 flex flex-col gap-4">
                                        <Skeleton className="w-10 h-10 rounded-xl" />
                                        <Skeleton className="h-4 w-32 rounded-full" />
                                        <Skeleton className="h-3 w-full rounded-full" />
                                        <Skeleton className="h-3 w-4/5 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-8">
                                <PageHeader subtitle={lang === 'ar' ? 'رُؤيتنا ومُهمتنا' : lang === 'ur' ? 'وژن اور مشن' : lang === 'zh' ? '愿景与使命' : lang === 'ru' ? 'Видение и миссия' : 'Vision & Mission'} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {ab.visionTitle && ab.visionText && (
                                    <HighlightCard
                                        icon="visibility"
                                        title={ab.visionTitle}
                                        text={ab.visionText}
                                        accent={true}
                                    />
                                )}
                                {ab.missionTitle && ab.missionText && (
                                    <HighlightCard
                                        icon="flag"
                                        title={ab.missionTitle}
                                        text={ab.missionText}
                                        accent={false}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── Why Us – 3 feature pillars ───────────────────────────── */}
            <div className="bg-[#1c1a17] py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12">
                        <PageHeader 
                            theme="dark"
                            center={true}
                            subtitle={lang === 'ar' ? 'لماذا النجار؟' : lang === 'ur' ? 'النجار کیوں؟' : lang === 'zh' ? '为什么选择我们' : lang === 'ru' ? 'Почему мы?' : 'Why Al Najjar?'} 
                            title={lang === 'ar' ? 'التزام بالجودة منذ 1975' : lang === 'ur' ? '1975 سے معیار کا عہد' : lang === 'zh' ? '自1975年以来的品质承诺' : lang === 'ru' ? 'Верность качеству с 1975 года' : 'Committed to Quality Since 1975'}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {[
                            {
                                icon: 'workspace_premium',
                                title: { ar: 'جودة عالمية', en: 'Global Quality', ur: 'عالمی معیار', zh: '全球品质', ru: 'Мировое качество' },
                                text:  { ar: 'منتجات مستوردة تخضع لأعلى المعايير الدولية', en: 'Imported products meeting the highest international standards', ur: 'بین الاقوامی معیار کی مصنوعات', zh: '符合最高国际标准的进口产品', ru: 'Импортные продукты мирового класса' },
                            },
                            {
                                icon: 'diversity_3',
                                title: { ar: 'خبرة تمتد لعقود', en: 'Decades of Experience', ur: 'دہائیوں کا تجربہ', zh: '数十年经验', ru: 'Десятилетия опыта' },
                                text:  { ar: 'أكثر من 50 عاماً في قطاع السيراميك والبورسلان', en: 'Over 50 years in the ceramics and porcelain industry', ur: 'سیرامکس میں 50 سال سے زیادہ', zh: '超过50年的陶瓷行业经验', ru: 'Более 50 лет в индустрии керамики' },
                            },
                            {
                                icon: 'support_agent',
                                title: { ar: 'خدمة متميزة', en: 'Premium Service', ur: 'اعلیٰ خدمت', zh: '优质服务', ru: 'Премиальный сервис' },
                                text:  { ar: 'فريق متخصص لخدمة احتياجاتك السكنية والتجارية', en: 'A dedicated team serving your residential & commercial needs', ur: 'رہائشی اور تجارتی ضروریات کے لیے', zh: '专业团队满足您的家居与商业需求', ru: 'Команда для жилых и коммерческих проектов' },
                            },
                        ].map((item, i) => (
                            <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col gap-4 hover:bg-white/8 transition-colors duration-200">
                                <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center">
                                    <span className="material-icons text-brand text-[22px]">{item.icon}</span>
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-[15px] mb-1.5">{item.title[lang] || item.title.en}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{item.text[lang] || item.text.en}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
});
