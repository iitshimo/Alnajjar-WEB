import { useState, useEffect, lazy, Suspense } from 'react';
import { API_BASE_URL } from './context/AdminContext.jsx';
import { LanguageProvider, useLang } from './context/LanguageContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Login from './admin/Login.jsx';

// Public pages are loaded only when visited to keep the initial home bundle small.
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const BranchesPage = lazy(() => import('./pages/BranchesPage.jsx'));
const ProductsPage = lazy(() => import('./pages/ProductsPage.jsx'));
// Lazy-load admin panel only when the admin route is requested.
const AdminPanel = lazy(() => import('./admin/AdminPanel.jsx'));

const normalizePath = () => window.location.pathname.replace(/\/+$/, '') || '/';
const publicPathPages = {
    '/': 'home',
    '/index.html': 'home',
    '/home': 'home',
    '/products': 'products',
    '/about': 'about',
    '/branches': 'branches',
    '/contact': 'contact',
};
const hashPages = {
    '#/': 'home',
    '#/home': 'home',
    '#/products': 'products',
    '#/about': 'about',
    '#/branches': 'branches',
    '#/contact': 'contact',
};

const getRouteState = () => {
    const path = normalizePath();
    if (path === '/alnajjar-root') return 'admin';
    if (Object.hasOwn(publicPathPages, path)) return 'app';
    return '404';
};

const getPublicPage = () => {
    const hash = window.location.hash;
    if (hash) return hashPages[hash] || 'notfound';
    return publicPathPages[normalizePath()] || 'notfound';
};

function NotFoundPage() {
    const { t } = useLang();
    return (
        <div className="min-h-screen bg-[#f7f6f4] flex flex-col items-center justify-center text-center px-4 selection:bg-brand/30">
            <h1 className="text-[140px] md:text-[200px] font-black tracking-tighter text-brand leading-none mb-4 drop-shadow-sm">
                404
            </h1>
            <p className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight mb-4">
                {t.notFound?.title || 'Page Not Found'}
            </p>
            <p className="text-zinc-500 font-medium mb-10 max-w-sm">
                {t.notFound?.desc || "The page you are looking for doesn't exist or has been moved."}
            </p>
            <a 
                href="/" 
                className="bg-[#18181b] hover:bg-[#27272a] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-3 active:scale-[0.98]"
            >
                <span className="material-icons text-[20px] text-brand">home</span>
                {t.notFound?.btn || 'Return to Home'}
            </a>
        </div>
    );
}

function AppContent() {
    const { t } = useLang();
    const [page, setPage] = useState(getPublicPage);

    useEffect(() => {
        const syncPage = () => {
            setPage(getPublicPage());
        };
        syncPage();
        window.addEventListener('hashchange', syncPage);
        window.addEventListener('popstate', syncPage);
        return () => {
            window.removeEventListener('hashchange', syncPage);
            window.removeEventListener('popstate', syncPage);
        };
    }, []);

    useEffect(() => {
        if (page === 'notfound') document.title = 'Al Najjar - Page Not Found';
        else if (page === 'about') document.title = `Al Najjar - ${t.nav['about'] || 'About Us'}`;
        else if (page === 'contact') document.title = `Al Najjar - ${t.nav['contact'] || 'Contact Us'}`;
        else document.title = `Al Najjar - ${t.nav['home'] || 'Home'}`;
    }, [page, t]);

    if (page === 'notfound') {
        return <NotFoundPage />;
    }

    return (
        <div className="relative bg-white text-zinc-800 font-sans selection:bg-brand/30">
            <Header currentPage={page} setPage={setPage} />
            <main className="w-full relative">
                <Suspense fallback={<div className="min-h-[50vh]" aria-busy="true" />}>
                    {page === 'home' && <Hero />}
                    {page === 'about' && <AboutPage />}
                    {page === 'contact' && <ContactPage />}
                    {page === 'branches' && <BranchesPage />}
                    {page === 'products' && <ProductsPage />}
                </Suspense>
            </main>
        </div>
    );
}

export default function App() {
    const [routeType] = useState(() => getRouteState());
    const [isAdminAuth, setIsAdminAuth] = useState(false);
    const [checkingAdminAuth, setCheckingAdminAuth] = useState(true);

    useEffect(() => {
        if (routeType !== 'admin') return;
        const token = sessionStorage.getItem('admin_token');
        if (!token) { setCheckingAdminAuth(false); return; }
        fetch(`${API_BASE_URL}/admin/session`, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                if (!response.ok) throw new Error('Session expired');
                setIsAdminAuth(true);
            })
            .catch(() => sessionStorage.removeItem('admin_token'))
            .finally(() => setCheckingAdminAuth(false));
    }, [routeType]);

    if (routeType === '404') {
        return (
            <LanguageProvider>
                <NotFoundPage />
            </LanguageProvider>
        );
    }

    if (routeType === 'admin') {
        return (
            <AdminProvider>
                <LanguageProvider>
                    {checkingAdminAuth ? (
                        <div className="flex h-screen items-center justify-center bg-[#0f0f11] text-zinc-400 text-sm">Checking admin session…</div>
                    ) : !isAdminAuth ? (
                        <Login onLogin={() => setIsAdminAuth(true)} />
                    ) : (
                        <Suspense fallback={
                            <div className="flex h-screen items-center justify-center bg-[#0f0f11] text-zinc-400 text-sm">
                                Loading Dashboard…
                            </div>
                        }>
                            <AdminPanel />
                        </Suspense>
                    )}
                </LanguageProvider>
            </AdminProvider>
        );
    }

    // fallback to normal app
    return (
        <AdminProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </AdminProvider>
    );
}
