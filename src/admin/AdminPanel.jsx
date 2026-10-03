import { useState, useEffect, memo } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import ProductsTab   from './tabs/ProductsTab.jsx';
import CategoriesTab from './tabs/CategoriesTab.jsx';
import PartnersTab   from './tabs/PartnersTab.jsx';
import ContactTab    from './tabs/ContactTab.jsx';
import HeroTab       from './tabs/HeroTab.jsx';
import BranchesTab   from './tabs/BranchesTab.jsx';
import AboutTab      from './tabs/AboutTab.jsx';
import DeliveryTab from './tabs/DeliveryTab.jsx';
import { useAdmin } from '../context/AdminContext.jsx';

const TAB_COMPONENTS = {
    delivery: DeliveryTab,
    products:   ProductsTab,
    categories: CategoriesTab,
    partners:   PartnersTab,
    contact:    ContactTab,
    hero:       HeroTab,
    branches:   BranchesTab,
    about:      AboutTab,
};

export default memo(function AdminPanel({ userRole }) {
    const { settingsError } = useAdmin();
    const defaultTab = userRole === 'dispatch_staff' ? 'delivery' : 'products';
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [mobileOpen,  setMobileOpen]  = useState(false);  // overlay on mobile
    const [collapsed,   setCollapsed]   = useState(false);  // icon-only on desktop

    const allowedTabs = userRole === 'super_admin'
        ? Object.keys(TAB_COMPONENTS)
        : userRole === 'dispatch_staff' ? ['delivery'] : [];
    const visibleTab = allowedTabs.includes(activeTab) ? activeTab : (allowedTabs[0] || null);
    const ActiveTab = visibleTab ? TAB_COMPONENTS[visibleTab] : null;

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    const handleTabClick = (id) => {
        if (!allowedTabs.includes(id)) return;
        setActiveTab(id);
        setMobileOpen(false);   // always close overlay on tab pick
    };

    return (
        <div className="flex h-dvh bg-[#0d0d10] text-white overflow-hidden">
            {/* ── Mobile overlay backdrop ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <Sidebar 
                activeTab={visibleTab}
                userRole={userRole}
                onTabClick={handleTabClick} 
                mobileOpen={mobileOpen} 
                setMobileOpen={setMobileOpen} 
                collapsed={collapsed} 
                setCollapsed={setCollapsed} 
            />

            {/* ── Main area ── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Top bar */}
                <Topbar activeTab={visibleTab} setMobileOpen={setMobileOpen} />

                {settingsError && <div role="alert" className="mx-4 mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{settingsError}</div>}

                {/* Tab content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {ActiveTab && <ActiveTab />}
                </main>
            </div>
        </div>
    );
});
