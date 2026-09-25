import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export const DEFAULT_CATEGORIES = [
    { id: 'porcelain', label: { ar: 'بورسلان',      en: 'Porcelain',         ur: 'پورسلین',    zh: '瓷砖',    ru: 'Фарфор',     es: 'Porcelanato' } },
    { id: 'ceramic',   label: { ar: 'سيراميك',      en: 'Ceramic',           ur: 'سیرامک',     zh: '陶瓷',    ru: 'Керамика',   es: 'Cerámica' } },
    { id: 'sanitary',  label: { ar: 'أدوات صحية',   en: 'Sanitary Ware',     ur: 'سینیٹری',    zh: '卫浴',    ru: 'Сантехника', es: 'Sanitarios' } },
    { id: 'install',   label: { ar: 'مواد تركيب',   en: 'Installation Aids', ur: 'تنصیب',      zh: '安装材料', ru: 'Монтаж',     es: 'Material de instalación' } },
    { id: 'protect',   label: { ar: 'حماية وتنظيف', en: 'Protection',        ur: 'حفاظت',      zh: '保护清洁', ru: 'Защита',     es: 'Protección y Limpieza' } },
    { id: 'adhesive',  label: { ar: 'غراء ورغوة',   en: 'Glue & Foam',       ur: 'چپکنے والا', zh: '胶粘剂',  ru: 'Клей',       es: 'Pegamento y Espuma' } },
];

// ... [Keep all the other DEFAULT_* constants from original] ...

const DEFAULT_CONTACT = {
    phone: '+968 2684 5084',
    whatsapp: '+968 9233 9400',
    email: 'contact@alnajjar-intl.com',
    address: 'Muscat – Head Office | Airport Road, 3rd Floor, Oman',
    mapUrl: 'https://maps.app.goo.gl/dggVrT56pJDV4oF96',
    tiktok: 'https://www.tiktok.com/@alnajjar.ceramic',
    instagram: '#',
    facebook: '#',
};

const API_BASE_URL = 'http://localhost:5000/api';

// ─── Context ───────────────────────────────────────────────────────────────────
const AdminContext = createContext(null);

export function AdminProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);

    // Fetch products from MongoDB API on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products`);
                const data = await response.json();

                if (data.success && Array.isArray(data.data)) {
                    // Transform MongoDB data to component format
                    const transformed = data.data.map(product => ({
                        id: product._id,
                        name: {
                            ar: product.nameAr || '',
                            en: product.nameEn || '',
                            ur: '',
                            zh: '',
                            ru: '',
                            es: '',
                        },
                        category: product.category || 'ceramic',
                        price: product.price || 0,
                        stock: product.stock || 0,
                        image: product.image || '',
                        specs: product.specs || {},
                        colors: product.colors || [],
                        sizes: product.sizes || [],
                        labels: product.labels || [],
                    }));

                    setProducts(transformed);
                    console.log('✅ Products loaded from MongoDB:', transformed);
                } else {
                    console.warn('⚠️ No products found in MongoDB');
                    setProducts([]);
                }
            } catch (error) {
                console.error('❌ Failed to fetch products from API:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Add product to MongoDB
    const addProduct = useCallback(async (product) => {
        try {
            // Create payload for MongoDB
            const payload = {
                nameAr: product.name?.ar || '',
                nameEn: product.name?.en || '',
                category: product.category || 'ceramic',
                price: parseFloat(product.price) || 0,
                stock: parseInt(product.stock) || 0,
                image: product.image || '',
            };

            // Send to API
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success && data.data) {
                // Add to local state with proper format
                const newProduct = {
                    id: data.data._id,
                    name: {
                        ar: data.data.nameAr || '',
                        en: data.data.nameEn || '',
                        ur: '',
                        zh: '',
                        ru: '',
                        es: '',
                    },
                    category: data.data.category || 'ceramic',
                    price: data.data.price || 0,
                    stock: data.data.stock || 0,
                    image: data.data.image || '',
                    specs: product.specs || {},
                    colors: product.colors || [],
                    sizes: product.sizes || [],
                    labels: product.labels || [],
                };

                setProducts(prev => [newProduct, ...prev]);
                console.log('✅ Product added to MongoDB:', newProduct);
                return newProduct;
            } else {
                console.error('❌ Failed to add product:', data);
            }
        } catch (error) {
            console.error('❌ Error adding product to MongoDB:', error);
        }
    }, []);

    // Update product (for now, update local state)
    const updateProduct = useCallback((id, updated) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    }, []);

    // Delete product
    const deleteProduct = useCallback((id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    }, []);

    const resetProducts = useCallback(() => {
        setProducts([]);
    }, []);

    // Minimal implementations for other functions
    const addCategory = useCallback((labelsOrString) => {}, []);
    const deleteCategory = useCallback((id) => {}, []);
    const resetCategories = useCallback(() => {}, []);
    const updateContactInfo = useCallback((data) => {}, []);
    const resetContact = useCallback(() => {}, []);
    const updateHeroSettings = useCallback((data) => {}, []);
    const resetHero = useCallback(() => {}, []);
    const updateAboutContent = useCallback((data) => {}, []);
    const resetAbout = useCallback(() => {}, []);
    const updatePartnersSettings = useCallback((data) => {}, []);
    const addPartner = useCallback((partner) => {}, []);
    const updatePartner = useCallback((id, data) => {}, []);
    const deletePartner = useCallback((id) => {}, []);
    const resetPartners = useCallback(() => {}, []);
    const addBranch = useCallback((data) => {}, []);
    const updateBranch = useCallback((id, data) => {}, []);
    const deleteBranch = useCallback((id) => {}, []);
    const resetBranches = useCallback(() => {}, []);

    const value = useMemo(() => ({
        products, addProduct, updateProduct, deleteProduct, resetProducts,
        categories: categories,
        loading,
        // Stubs for other functions
        addCategory, deleteCategory, resetCategories,
        updateContactInfo: () => {}, resetContact: () => {},
        updateHeroSettings: () => {}, resetHero: () => {},
        updateAboutContent: () => {}, resetAbout: () => {},
        updatePartnersSettings: () => {}, addPartner: () => {}, updatePartner: () => {}, deletePartner: () => {}, resetPartners: () => {},
        addBranch: () => {}, updateBranch: () => {}, deleteBranch: () => {}, resetBranches: () => {},
    }), [products, categories, loading, addProduct, updateProduct, deleteProduct]);

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) throw new Error('useAdmin must be used within AdminProvider');
    return context;
}
