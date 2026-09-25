import { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';

import { Skeleton, SkeletonCard } from './ui/Skeleton.jsx';
import { PageHeader } from './ui/PageHeader.jsx';
import { Input } from './ui/Input.jsx';

// ─── Product Card ────────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({ product, lang, onOpen, categories }) {
    const { formatPrice } = useLang();
    const name = product.name?.[lang] || product.name?.en || '';

    const catMeta = categories.find(c => c.id === product.category);
    const catLabel = catMeta?.label?.[lang] || catMeta?.label?.en || '';

    return (
        <button
            type="button"
            onClick={() => onOpen(product)}
            className="text-start group w-full bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-2000 flex flex-col cursor-pointer"
        >
            {/* Image */}
            <div className="relative h-44 bg-zinc-50 overflow-hidden shrink-0">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-300">
                        <span className="material-icons text-4xl">category</span>
                    </div>
                )}
                {/* Category badge */}
                {catLabel && (
                    <span className="absolute top-2.5 inset-s-2.5 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-black/50 text-white backdrop-blur-sm">
                        {catLabel}
                    </span>
                )}
                {/* Arrow hint on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="material-icons text-white text-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow">open_in_new</span>
                </div>
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col gap-1 flex-1">
                <h3 className="font-bold text-zinc-800 text-[13px] leading-snug line-clamp-2">{name}</h3>
                <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="inline-flex items-center gap-1 text-[13px] font-black text-zinc-900">{formatPrice(product.price)}</span>
                    {product.colors?.length > 0 && (
                        <div className="flex items-center gap-1">
                            {product.colors.slice(0, 4).map((c, i) => (
                                <span key={i} className="w-3.5 h-3.5 rounded-full border border-white ring-1 ring-zinc-200 shrink-0" style={{ backgroundColor: c.color }} />
                            ))}
                            {product.colors.length > 4 && <span className="text-[9px] text-zinc-400 font-semibold">+{product.colors.length - 4}</span>}
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
});

// ─── Product Modal ───────────────────────────────────────────────────────────
const ProductModal = memo(function ProductModal({ product, lang, onClose }) {
    const [activeColor, setActiveColor] = useState(0);
    const [activeImg, setActiveImg] = useState(0);
    const { formatPrice } = useLang();

    const getColorImages = (colorIdx) => {
        const c = product.colors?.[colorIdx];
        if (!c) return product.images?.length ? product.images : (product.image ? [product.image] : []);
        const imgs = c.images || (c.image ? [c.image] : []);
        return imgs.length ? imgs : (product.images?.length ? product.images : (product.image ? [product.image] : []));
    };

    const images = getColorImages(activeColor);
    const name = product.name?.[lang] || product.name?.en || '';
    const specs = product.specs || {};

    const handleColorSelect = (i) => {
        setActiveColor(i);
        setActiveImg(0);
    };

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-zinc-200" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                    <h2 className="font-black text-zinc-800 text-base leading-snug max-w-[80%] line-clamp-2">{name}</h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    >
                        <span className="material-icons text-[20px] text-zinc-500">close</span>
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-5">
                    {/* Images */}
                    {images.length > 0 && (
                        <div>
                            <div className="aspect-video bg-zinc-50 rounded-2xl overflow-hidden mb-3">
                                <img key={`${activeColor}-${activeImg}`} src={images[activeImg]} alt={name} className="w-full h-full object-contain" loading="lazy" />
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                                    {images.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImg(i)}
                                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${activeImg === i ? 'border-brand scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={s} alt="" className="w-full h-full object-cover" loading="lazy" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-zinc-900">{formatPrice(product.price)}</span>
                    </div>

                    {/* Colors */}
                    {product.colors?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2.5">
                                {lang === 'ar' ? 'الألوان' : lang === 'ur' ? 'رنگ' : lang === 'zh' ? '颜色' : lang === 'ru' ? 'Цвета' : 'Colors'}
                            </p>
                            <div className="flex gap-3 flex-wrap">
                                {product.colors.map((c, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleColorSelect(i)}
                                        className="flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                                        title={c.label}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${activeColor === i ? 'border-brand scale-110 shadow-lg shadow-brand/20' : 'border-transparent hover:scale-105 ring-1 ring-zinc-200'}`}
                                            style={{ backgroundColor: c.color }}
                                        />
                                        {c.label && (
                                            <span className={`text-[9px] font-bold ${activeColor === i ? 'text-brand' : 'text-zinc-400'}`}>
                                                {c.label}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sizes */}
                    {product.sizes?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2.5">
                                {lang === 'ar' ? 'المقاسات (سم)' : lang === 'ur' ? 'سائز (سینٹی میٹر)' : lang === 'zh' ? '尺寸（厘米）' : lang === 'ru' ? 'Размеры (см)' : 'Sizes (cm)'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(s => (
                                    <span key={s} className="px-3 py-1.5 rounded-xl bg-brand/10 text-brand border border-brand/20 text-xs font-bold">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Specs */}
                    {Object.keys(specs).length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2.5">
                                {lang === 'ar' ? 'المواصفات' : lang === 'ur' ? 'تفصیلات' : lang === 'zh' ? '规格' : lang === 'ru' ? 'Характеристики' : 'Specifications'}
                            </p>
                            <div className="bg-zinc-50 rounded-2xl divide-y divide-zinc-100 border border-zinc-100">
                                {Object.entries(specs).map(([k, v]) => (
                                    <div key={k} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                        <span className="text-zinc-500 font-medium">{k}</span>
                                        <span className="text-zinc-800 font-bold">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});


// ─── Main ────────────────────────────────────────────────────────────────────
export default function Products() {
    const { products = [], categories = [] } = useAdmin();
    const { lang, t } = useLang();
    const isRtl = t.dir === 'rtl';

    // Grouping
    const catTabs = useMemo(() => [{ id: 'all', label: { ar: 'الكل', en: 'All', ur: 'سب', zh: '全部', ru: 'Все' } }, ...categories], [categories]);

    const [catFilter, setCatFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const catScrollRef = useRef(null);

    useEffect(() => {
        const id = setTimeout(() => setLoaded(true), 500);
        return () => clearTimeout(id);
    }, []);

    const openProduct = useCallback((p) => setSelectedProduct(p), []);
    const closeModal = useCallback(() => setSelectedProduct(null), []);

    const filtered = useMemo(() => {
        let list = catFilter === 'all' ? products : products.filter(p => p.category === catFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p => Object.values(p.name || {}).some(n => n.toLowerCase().includes(q)));
        }
        return list;
    }, [products, catFilter, search]);

    return (
        <section dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f7f6f4]">
            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="bg-white border-b border-zinc-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
                    {!loaded ? (
                        <div className="flex flex-col gap-3">
                            <Skeleton className="h-3 w-24 rounded-full" />
                            <Skeleton className="h-8 w-64 rounded-xl" />
                        </div>
                    ) : (
                        <div>
                        <PageHeader 
                            subtitle={t.nav?.products}
                            title={lang === 'ar' ? 'تشكيلة منتجاتنا' : lang === 'ur' ? 'ہماری مصنوعات' : lang === 'zh' ? '我们的产品系列' : lang === 'ru' ? 'Наш ассортимент' : 'Our Product Collection'}
                        />
                        </div>
                    )}
                </div>

                {/* ── Category Horizontal Scroll ─────────────────────── */}
                <div className="max-w-7xl mx-auto">
                    <div
                        ref={catScrollRef}
                        className="flex gap-2 overflow-x-auto hide-scrollbar px-6 sm:px-10 pb-4 pt-1"
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        {!loaded ? (
                            [80, 60, 90, 110, 75, 80, 65].map((w, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-8 rounded-full flex-shrink-0"
                                    style={{ width: `${w}px` }}
                                />
                            ))
                        ) : (
                            catTabs.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCatFilter(cat.id)}
                                    style={{ scrollSnapAlign: 'start' }}
                                    className={`shrink-0 px-5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer ${catFilter === cat.id
                                        ? 'bg-brand text-white shadow-md shadow-brand/30'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                    }`}
                                >
                                    {cat.label?.[lang] || cat.label?.en || cat.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Search Bar ──────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5">
                <div className="max-w-md">
                    <Input
                        icon="search"
                        isRtl={isRtl}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={lang === 'ar' ? 'ابحث عن منتج...' : lang === 'ur' ? 'مصنوع تلاش کریں...' : lang === 'zh' ? '搜索产品...' : lang === 'ru' ? 'Поиск продуктов...' : 'Search products...'}
                        className="bg-white! shadow-sm"
                    />
                </div>

                {/* Count */}
                {loaded && (
                    <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider mt-4 mb-1">
                        {filtered.length} {lang === 'ar' ? 'منتج' : lang === 'ur' ? 'مصنوعات' : lang === 'zh' ? '件产品' : lang === 'ru' ? 'товаров' : 'products'}
                    </p>
                )}
            </div>

            {/* ── Products Grid ────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-16">
                {!loaded ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-zinc-400">
                        <span className="material-icons text-5xl block mb-3">search_off</span>
                        <p className="font-semibold text-sm">
                            {lang === 'ar' ? 'لا توجد منتجات' : lang === 'ur' ? 'کوئی مصنوع نہیں ملا' : lang === 'zh' ? '未找到产品' : lang === 'ru' ? 'Нет товаров' : 'No products found'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(p => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                lang={lang}
                                onOpen={openProduct}
                                categories={categories}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modal ────────────────────────────────────────────────── */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    lang={lang}
                    onClose={closeModal}
                />
            )}
        </section>
    );
}
