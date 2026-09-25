import { memo, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';

import { getCategories } from '../api/client.js';

useEffect(() => {
    getCategories().then(data => {
        console.log('الفئات:', data);
    });
}, []);

export default memo(function Partners() {
    const { partnersSettings } = useAdmin();
    const { lang } = useLang();

    const items = useMemo(() => partnersSettings?.items || [], [partnersSettings]);
    const mode = partnersSettings?.mode || 'grid';

    const sectionLabel = {
        ar: 'شركاؤنا',
        en: 'Our Partners',
        ur: 'ہمارے شراکت دار',
        zh: '我们的合作伙伴',
        ru: 'Наши партнёры',
    };
    const sectionTag = {
        ar: 'الشركاء والموردون',
        en: 'Partners & Suppliers',
        ur: 'شراکت دار اور سپلائرز',
        zh: '合作伙伴与供应商',
        ru: 'Партнёры и поставщики',
    };

    if (!items.length) return null;

    return (
        <section className="bg-[#f5f4f2] py-16 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center gap-3 justify-center mb-3">
                        <span className="h-px w-10 bg-brand" />
                        <span className="text-brand text-xs font-bold tracking-[0.2em] uppercase">{sectionTag[lang]}</span>
                        <span className="h-px w-10 bg-brand" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-zinc-800">{sectionLabel[lang]}</h2>
                </div>

                {/* Grid / Slider */}
                {mode === 'grid' ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                        {items.map((p) => (
                            <PartnerLogo key={p.id} item={p} lang={lang} />
                        ))}
                    </div>
                ) : (
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-16 z-10 bg-linear-to-r from-[#f5f4f2] to-transparent pointer-events-none" />
                        <div className="absolute inset-y-0 right-0 w-16 z-10 bg-linear-to-l from-[#f5f4f2] to-transparent pointer-events-none" />
                        <div className="flex gap-4 animate-[partners-scroll_30s_linear_infinite] w-max">
                            {[...items, ...items].map((p, i) => (
                                <PartnerLogo key={`${p.id}-${i}`} item={p} lang={lang} />
                            ))}
                        </div>
                        <style>{`@keyframes partners-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
                    </div>
                )}
            </div>
        </section>
    );
});

const PartnerLogo = memo(function PartnerLogo({ item, lang }) {
    return (
        <div className="flex items-center justify-center bg-white rounded-2xl p-3 h-[72px] shrink-0 border border-zinc-100">
            <img
                src={item.img}
                alt={item.name?.[lang] || item.name?.en || 'Partner'}
                className="h-10 w-auto max-w-full object-contain"
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
        </div>
    );
});
