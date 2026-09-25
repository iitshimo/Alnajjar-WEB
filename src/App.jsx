import { useState, useEffect, lazy, Suspense } from 'react';
import { LanguageProvider, useLang } from './context/LanguageContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import BranchesPage from './pages/BranchesPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import Login from './admin/Login.jsx';

// Lazy-load admin panel — only loads when user visits /alnajjer-root
const AdminPanel = lazy(() => import('./admin/AdminPanel.jsx'));

const getRouteState = () => {
    const p = window.location.pathname;
    if (p === '/alnajjar-root') return 'admin';
    if (p === '/' || p === '/index.html') return 'app';
    return '404';
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
    const [page, setPage] = useState('home');

    useEffect(() => {
        const syncPage = () => {
            const hash = window.location.hash;
            if (hash === '' || hash === '#/' || hash === '#/home') setPage('home');
            else if (hash === '#/about') setPage('about');
            else if (hash === '#/contact') setPage('contact');
            else if (hash === '#/branches') setPage('branches');
            else if (hash === '#/products') setPage('products');
            else setPage('notfound');
        };
        syncPage();
        window.addEventListener('hashchange', syncPage);
        return () => window.removeEventListener('hashchange', syncPage);
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
                {page === 'home' && <Hero />}
                {page === 'about' && <AboutPage />}
                {page === 'contact' && <ContactPage />}
                {page === 'branches' && <BranchesPage />}
                {page === 'products' && <ProductsPage />}
            </main>
        </div>
    );
}

export default function App() {
    const [routeType] = useState(() => getRouteState());
    const [isAdminAuth, setIsAdminAuth] = useState(() => sessionStorage.getItem('admin_auth') === 'true');

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
                    {!isAdminAuth ? (
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
