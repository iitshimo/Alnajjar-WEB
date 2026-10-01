import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export const DEFAULT_CATEGORIES = [
    { id: 'porcelain', label: { ar: 'بورسلان', en: 'Porcelain', ur: 'پورسلین', zh: '瓷砖', ru: 'Фарфор', es: 'Porcelanato' } },
    { id: 'ceramic', label: { ar: 'سيراميك', en: 'Ceramic', ur: 'سیرامک', zh: '陶瓷', ru: 'Керамика', es: 'Cerámica' } },
    { id: 'sanitary', label: { ar: 'أدوات صحية', en: 'Sanitary Ware', ur: 'سینیٹری', zh: '卫浴', ru: 'Сантехника', es: 'Sanitarios' } },
    { id: 'install', label: { ar: 'مواد تركيب', en: 'Installation Aids', ur: 'تنصیب', zh: '安装材料', ru: 'Монтаж', es: 'Material de instalación' } },
    { id: 'protect', label: { ar: 'حماية وتنظيف', en: 'Protection', ur: 'حفاظت', zh: '保护清洁', ru: 'Защита', es: 'Protección y Limpieza' } },
    { id: 'adhesive', label: { ar: 'غراء ورغوة', en: 'Glue & Foam', ur: 'چپکنے والا', zh: '胶粘剂', ru: 'Клей', es: 'Pegamento y Espuma' } },
];

import { API_BASE_URL } from '../api/config.js';
export { API_BASE_URL };
const languages = ['ar', 'en', 'ur', 'zh', 'ru', 'es'];
const readApiResponse = async (response) => {
    const body = await response.text();
    let result;
    try { result = body ? JSON.parse(body) : {}; }
    catch { result = { message: body }; }
    if (!response.ok || result.success === false) {
        throw new Error(result.message || `HTTP ${response.status}`);
    }
    return result;
};
const readSetting = (key, fallback) => {
    try {
        const stored = localStorage.getItem(`alnajjar_${key}`);
        if (!stored) return fallback;
        const parsed = JSON.parse(stored);
        return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : { ...fallback, ...parsed };
    } catch { return fallback; }
};
const DEFAULT_CONTACT = { phone: '+968 2684 5084', whatsapp: '+968 9233 9400', email: 'contact@alnajjar-intl.com', addressEn: 'Muscat – Head Office | Airport Road, 3rd Floor, Oman', addressAr: '', mapUrl: 'https://maps.app.goo.gl/dggVrT56pJDV4oF96', tiktok: 'https://www.tiktok.com/@alnajjar.ceramic', instagram: '#', facebook: '#' };
const DEFAULT_HERO = { type: 'video', src: '/Assets/Video/background_video_site.mp4', tag: {}, title1: {}, title2: {}, subtitle: {} };
const DEFAULT_ABOUT = { title: {}, description: {}, stats: [] };
const DEFAULT_PARTNERS = { mode: 'grid', items: [] };
const DEFAULT_BRANCHES = [];
const toProduct = (product) => ({
    ...product,
    id: product._id || product.id,
    name: Object.fromEntries(languages.map(language => [language,
        language === 'ar' ? (product.nameAr || product.name?.ar || '') : language === 'en' ? (product.nameEn || product.name?.en || '') : (product.name?.[language] || '')
    ])),
    category: product.category || 'ceramic',
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    image: product.image || '',
    specs: product.specs || {}, colors: product.colors || [], images: product.images || [], sizes: product.sizes || [], labels: product.labels || [],
});

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(() => readSetting('categories', DEFAULT_CATEGORIES));
    const [contactInfo, setContactInfo] = useState(() => readSetting('contact', DEFAULT_CONTACT));
    const [heroSettings, setHeroSettings] = useState(() => readSetting('hero', DEFAULT_HERO));
    const [aboutContent, setAboutContent] = useState(() => readSetting('about', DEFAULT_ABOUT));
    const [partnersSettings, setPartnersSettings] = useState(() => readSetting('partners', DEFAULT_PARTNERS));
    const [branches, setBranches] = useState(() => readSetting('branches', DEFAULT_BRANCHES));
    const [loading, setLoading] = useState(true);
    const [productsError, setProductsError] = useState('');
    const [settingsError, setSettingsError] = useState('');
    const [pendingOperations, setPendingOperations] = useState(0);
    const isLoading = pendingOperations > 0;

    const authHeaders = () => ({ Authorization: `Bearer ${sessionStorage.getItem('admin_token') || ''}` });
    const refreshProducts = useCallback(async () => {
        setProductsError('');
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const result = await readApiResponse(response);
            if (!Array.isArray(result.data)) throw new Error('The products API returned an invalid response');
            const transformed = result.data.map(toProduct);
            setProducts(transformed);
            console.info('✅ Products loaded from API:', transformed);
        } catch (error) {
            console.error('❌ Failed to load products from API:', error);
            setProductsError(error.message || 'Unable to load products from MongoDB');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { refreshProducts(); }, [refreshProducts]);

    useEffect(() => {
        let cancelled = false;
        fetch(`${API_BASE_URL}/settings`).then(readApiResponse).then(({ data = {} }) => {
            if (cancelled) return;
            if (data.categories) setCategories(data.categories);
            if (data.contact) setContactInfo(data.contact);
            if (data.hero) setHeroSettings(data.hero);
            if (data.about) setAboutContent(data.about);
            if (data.partners) setPartnersSettings(data.partners);
            if (data.branches) setBranches(data.branches);
        }).catch(error => console.error('Failed to load shared site settings:', error));
        return () => { cancelled = true; };
    }, []);

    const saveSetting = useCallback((key, value, setter) => {
        setter(value);
        try { localStorage.setItem(`alnajjar_${key}`, JSON.stringify(value)); }
        catch (error) { console.error(`Unable to save ${key} settings:`, error); }
        fetch(`${API_BASE_URL}/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ [key]: value }) })
            .then(readApiResponse)
            .then(() => setSettingsError(''))
            .catch(error => {
                console.error(`Unable to save shared ${key} settings:`, error);
                setSettingsError(`Could not publish ${key} changes. Check your admin session and API connection, then save again.`);
            });
    }, []);
    const updateContactInfo = useCallback(data => saveSetting('contact', { ...contactInfo, ...data }, setContactInfo), [contactInfo, saveSetting]);
    const resetContact = useCallback(() => saveSetting('contact', DEFAULT_CONTACT, setContactInfo), [saveSetting]);
    const updateHeroSettings = useCallback(data => saveSetting('hero', { ...heroSettings, ...data }, setHeroSettings), [heroSettings, saveSetting]);
    const resetHero = useCallback(() => saveSetting('hero', DEFAULT_HERO, setHeroSettings), [saveSetting]);
    const updateAboutContent = useCallback(data => saveSetting('about', data, setAboutContent), [saveSetting]);
    const resetAbout = useCallback(() => saveSetting('about', DEFAULT_ABOUT, setAboutContent), [saveSetting]);
    const updatePartnersSettings = useCallback(data => saveSetting('partners', { ...partnersSettings, ...data }, setPartnersSettings), [partnersSettings, saveSetting]);
    const addPartner = useCallback(item => updatePartnersSettings({ items: [...partnersSettings.items, { ...item, id: item.id || crypto.randomUUID() }] }), [partnersSettings, updatePartnersSettings]);
    const updatePartner = useCallback((id, data) => updatePartnersSettings({ items: partnersSettings.items.map(item => item.id === id ? { ...item, ...data } : item) }), [partnersSettings, updatePartnersSettings]);
    const deletePartner = useCallback(id => updatePartnersSettings({ items: partnersSettings.items.filter(item => item.id !== id) }), [partnersSettings, updatePartnersSettings]);
    const resetPartners = useCallback(() => saveSetting('partners', DEFAULT_PARTNERS, setPartnersSettings), [saveSetting]);
    const addBranch = useCallback(data => saveSetting('branches', [...branches, { ...data, id: crypto.randomUUID() }], setBranches), [branches, saveSetting]);
    const updateBranch = useCallback((id, data) => saveSetting('branches', branches.map(item => item.id === id ? { ...item, ...data } : item), setBranches), [branches, saveSetting]);
    const deleteBranch = useCallback(id => saveSetting('branches', branches.filter(item => item.id !== id), setBranches), [branches, saveSetting]);
    const resetBranches = useCallback(() => saveSetting('branches', DEFAULT_BRANCHES, setBranches), [saveSetting]);
    const addCategory = useCallback(labels => {
        const label = typeof labels === 'string' ? { en: labels, ar: labels } : labels;
        const id = (label.en || label.ar || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || crypto.randomUUID();
        const next = [...categories, { id, label }];
        saveSetting('categories', next, setCategories);
    }, [categories, saveSetting]);
    const deleteCategory = useCallback(id => saveSetting('categories', categories.filter(item => item.id !== id), setCategories), [categories, saveSetting]);
    const resetCategories = useCallback(() => saveSetting('categories', DEFAULT_CATEGORIES, setCategories), [saveSetting]);

    const addProduct = useCallback(async (product) => {
        const payload = {
            nameAr: product.name?.ar || '', nameEn: product.name?.en || '',
            category: product.category || 'ceramic', price: Number(product.price) || 0,
            stock: Number(product.stock) || 0, image: product.image || '',
            specs: product.specs || {}, colors: product.colors || [], images: product.images || [], sizes: product.sizes || [], labels: product.labels || [],
        };
        setPendingOperations(count => count + 1);
        try {
            const response = await fetch(`${API_BASE_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
            const result = await readApiResponse(response);
            if (!result.success || !result.data) throw new Error('The products API did not return the saved product');
            const saved = toProduct(result.data);
            setProducts(previous => [saved, ...previous]);
            console.info('✅ Product added to MongoDB:', saved.id);
            return saved;
        } catch (error) {
            console.error('❌ Failed to save product to MongoDB:', error);
            throw error;
        } finally { setPendingOperations(count => Math.max(0, count - 1)); }
    }, []);

    const updateProduct = useCallback(async (id, product) => {
        setPendingOperations(count => count + 1);
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({
                nameAr: product.name?.ar || '', nameEn: product.name?.en || '', category: product.category || 'ceramic',
                price: Number(product.price) || 0, stock: Number(product.stock) || 0, image: product.image || '',
                specs: product.specs || {}, colors: product.colors || [], images: product.images || [], sizes: product.sizes || [], labels: product.labels || [],
            }) });
            const result = await readApiResponse(response);
            if (!result.success || !result.data) throw new Error('The products API did not return the updated product');
            const updated = toProduct(result.data);
            setProducts(previous => previous.map(item => item.id === id ? updated : item));
            console.info('✅ Product updated in MongoDB:', updated);
            return updated;
        } catch (error) { console.error('❌ Failed to update product:', error); throw error; }
        finally { setPendingOperations(count => Math.max(0, count - 1)); }
    }, []);

    const deleteProduct = useCallback(async (id) => {
        setPendingOperations(count => count + 1);
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
            });
            const result = await readApiResponse(response);
            if (!result.success) throw new Error('The products API did not confirm deletion');
            setProducts(previous => previous.filter(item => item.id !== id));
            console.log('✅ Product deleted from MongoDB:', id);
            return true;
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            return { success: false, error: error.message || 'Unable to delete product' };
        } finally { setPendingOperations(count => Math.max(0, count - 1)); }
    }, []);

    const value = useMemo(() => ({
        products, categories, loading, productsError, settingsError, isLoading, refreshProducts, addProduct, updateProduct, deleteProduct, resetProducts: refreshProducts,
        contactInfo, updateContactInfo, resetContact, heroSettings, updateHeroSettings, resetHero,
        aboutContent, updateAboutContent, resetAbout, partnersSettings, updatePartnersSettings, addPartner, updatePartner, deletePartner, resetPartners,
        branches, addBranch, updateBranch, deleteBranch, resetBranches, addCategory, deleteCategory, resetCategories,
    }), [products, categories, loading, productsError, settingsError, isLoading, refreshProducts, addProduct, updateProduct, deleteProduct, contactInfo, updateContactInfo, resetContact, heroSettings, updateHeroSettings, resetHero, aboutContent, updateAboutContent, resetAbout, partnersSettings, updatePartnersSettings, addPartner, updatePartner, deletePartner, resetPartners, branches, addBranch, updateBranch, deleteBranch, resetBranches, addCategory, deleteCategory, resetCategories]);
    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) throw new Error('useAdmin must be used within AdminProvider');
    return context;
}
