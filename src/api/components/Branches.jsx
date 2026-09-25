import { useState, useEffect, useMemo, memo } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useAdmin } from '../context/AdminContext.jsx';
import MainBranImg from '../Assets/Branches/main_bran.png';



const COUNTRIES = [
    { code: 'OM', label: 'Oman' },
    { code: 'AE', label: 'UAE' },
];

const TYPE_META = {
    branch: { icon: 'store', color: 'bg-brand/10 text-brand', label: { ar: 'فرع', en: 'Branch', ru: 'Офис' } },
    warehouse: { icon: 'warehouse', color: 'bg-zinc-100 text-zinc-500', label: { ar: 'مستودع', en: 'Warehouse', ru: 'Склад' } },
    showroom: { icon: 'gallery_thumbnail', color: 'bg-blue-50 text-blue-500', label: { ar: 'معرض', en: 'Showroom', ru: 'Шоурум' } },
};

const shimmerStyle = {
    background: 'linear-gradient(90deg, #e8e5e0 25%, #f2efea 50%, #e8e5e0 75%)',
    backgroundSize: '400px 100%',
    animation: 'branches-shimmer 1.4s infinite linear',
};

// ─── Skeletons ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
        <div className="w-full h-44" style={shimmerStyle} />
        <div className="p-5 flex flex-col gap-3 flex-1">
            <div className="h-4 w-40 rounded-full" style={shimmerStyle} />
            <div className="h-3 w-full rounded-full" style={shimmerStyle} />
            <div className="flex flex-col gap-2 mt-2">
                <div className="h-3 w-48 rounded-full" style={shimmerStyle} />
                <div className="h-3 w-40 rounded-full" style={shimmerStyle} />
                <div className="h-3 w-32 rounded-full" style={shimmerStyle} />
            </div>
            <div className="h-10 w-full rounded-xl mt-auto" style={shimmerStyle} />
        </div>
    </div>
);

// ─── Branch Card ──────────────────────────────────────────────────────────────
const BranchCard = memo(function BranchCard({ branch, lang, labels }) {
    const loc = (obj) => obj?.[lang] || obj?.en || '';
    const meta = TYPE_META[branch.type] || TYPE_META.branch;

    return (
        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
            <div className="relative w-full h-44 bg-zinc-100 flex items-center justify-center shrink-0 overflow-hidden">
                {branch.image ? (
                    <img src={branch.image} alt={loc(branch.nameKey)} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-300 select-none">
                        <span className="material-icons text-[40px]">{meta.icon}</span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Photo coming soon</span>
                    </div>
                )}
                <span className={`absolute top-3 inset-e-3 text-[10px] font-black px-2.5 py-1 rounded-full ${meta.color}`}>
                    {loc(meta.label)}
                </span>
            </div>

            <div className="p-5 flex flex-col gap-3 flex-1">
                <div>
                    <h2 className="font-black text-zinc-800 text-[15px] leading-snug">{loc(branch.nameKey)}</h2>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{loc(branch.descKey)}</p>
                </div>

                <div className="flex flex-col gap-2 text-xs text-zinc-500">
                    <div className="flex items-start gap-2">
                        <span className="material-icons text-brand text-[15px] shrink-0 mt-px">location_on</span>
                        <span className="leading-relaxed">{loc(branch.address)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-icons text-brand text-[15px] shrink-0">schedule</span>
                        <span>{loc(branch.hours)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-icons text-brand text-[15px] shrink-0">phone</span>
                        <a dir="ltr" href={`tel:${branch.phone}`} className="font-semibold text-zinc-700 cursor-pointer">
                            {branch.phone}
                        </a>
                    </div>
                </div>

                {branch.mapUrl ? (
                    <a href={branch.mapUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl border border-brand/30 text-brand hover:bg-brand hover:text-black text-xs font-bold transition-all duration-300 delay-3000 cursor-pointer">
                        <span className="material-icons text-[15px]">near_me</span>
                        {loc(labels.map)}
                    </a>
                ) : (
                    <div className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 text-zinc-300 text-xs font-bold cursor-not-allowed select-none">
                        <span className="material-icons text-[15px]">near_me</span>
                        <span>Location coming soon</span>
                    </div>
                )}
            </div>
        </div>
    );
});

// ─── Main ─────────────────────────────────────────────────────────────────────
export default memo(function Branches() {
    const { t, lang } = useLang();
    const { branches: adminBranches } = useAdmin();
    const isRtl = t.dir === 'rtl';
    const [country, setCountry] = useState('OM');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const id = setTimeout(() => setLoaded(true), 600);
        return () => clearTimeout(id);
    }, []);

    // Map admin flat shape → display shape expected by BranchCard
    const BRANCHES = useMemo(() => (adminBranches || []).map(b => ({
        ...b,
        image: b.image || (b.id === 'br1' ? MainBranImg : null),
        nameKey: { en: b.nameEn, ar: b.nameAr },
        descKey: { en: '', ar: '' },
        address: { en: b.address, ar: b.address },
        hours: { en: b.hoursEn, ar: b.hoursAr },
        mapUrl: b.mapUrl || null,
    })), [adminBranches]);

    const labels = {
        title: { ar: 'فروعنا ومستودعاتنا', en: 'Our Branches & Warehouses', ur: 'ہماری شاخیں', zh: '我们的分支', ru: 'Наши офисы' },
        sub: { ar: 'تواجدنا في المنطقة', en: 'Regional Presence', ur: 'علاقائی موجودگی', zh: '区域布局', ru: 'Региональное присутствие' },
        map: { ar: 'عرض الخريطة', en: 'View on Map', ur: 'نقشہ دیکھیں', zh: '查看地图', ru: 'Смотреть карту' },
    };

    const loc = (obj) => obj?.[lang] || obj?.en || '';
    const filtered = useMemo(() => BRANCHES.filter(b => b.country === country), [country]);

    return (
        <section dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f7f6f4]">
            <style>{`@keyframes branches-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>

            {/* Page Header */}
            <div className="bg-white border-b border-zinc-100">
                <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        {!loaded ? (
                            <div className="flex flex-col items-center sm:items-start gap-3">
                                <div className="h-3 w-32 rounded-full" style={shimmerStyle} />
                                <div className="h-8 w-64 rounded-xl" style={shimmerStyle} />
                            </div>
                        ) : (
                            <div className="text-center sm:text-start">
                                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                                    <span className="h-px w-8 bg-brand" />
                                    <span className="text-brand text-[10px] font-bold tracking-[0.3em] uppercase">{loc(labels.sub)}</span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight">
                                    {loc(labels.title)}
                                </h1>
                            </div>
                        )}

                        <div className="flex items-center bg-zinc-100 rounded-2xl p-1.5 gap-1.5">
                            {!loaded ? (
                                <>
                                    <div style={{ height: '40px', width: '90px', borderRadius: '12px', background: 'linear-gradient(90deg, #c8c4be 25%, #dedad4 50%, #c8c4be 75%)', backgroundSize: '400px 100%', animation: 'branches-shimmer 1.3s infinite linear' }} />
                                    <div style={{ height: '40px', width: '80px', borderRadius: '12px', background: 'linear-gradient(90deg, #c8c4be 25%, #dedad4 50%, #c8c4be 75%)', backgroundSize: '400px 100%', animation: 'branches-shimmer 1.3s infinite linear', animationDelay: '0.2s' }} />
                                </>
                            ) : (
                                COUNTRIES.map(c => (
                                    <button key={c.code} onClick={() => setCountry(c.code)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black transition-all duration-200 cursor-pointer ${country === c.code ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>
                                        <span>{c.label}</span>
                                        {country === c.code && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
                {!loaded ? (
                    <div className="h-3 w-40 rounded-full mb-6" style={shimmerStyle} />
                ) : (
                    <p className="text-[11px] text-zinc-400 font-semibold mb-6 uppercase tracking-wider">
                        {filtered.length} {country === 'OM' ? 'Oman locations' : 'UAE locations'}
                    </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {!loaded ? (
                        [1, 2, 3].map(i => <SkeletonCard key={i} />)
                    ) : (
                        filtered.map(branch => (
                            <BranchCard key={branch.id} branch={branch} lang={lang} labels={labels} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
});
