import { useState, memo } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import ProductsTab   from './tabs/ProductsTab.jsx';
import CategoriesTab from './tabs/CategoriesTab.jsx';
import PartnersTab   from './tabs/PartnersTab.jsx';
import ContactTab    from './tabs/ContactTab.jsx';
import HeroTab       from './tabs/HeroTab.jsx';
import BranchesTab   from './tabs/BranchesTab.jsx';
import AboutTab      from './tabs/AboutTab.jsx';

const TAB_COMPONENTS = {
    products:   ProductsTab,
    categories: CategoriesTab,
    partners:   PartnersTab,
    contact:    ContactTab,
    hero:       HeroTab,
    branches:   BranchesTab,
    about:      AboutTab,
};

export default memo(function AdminPanel() {
    const [activeTab,   setActiveTab]   = useState('products');
    const [mobileOpen,  setMobileOpen]  = useState(false);  // overlay on mobile
    const [collapsed,   setCollapsed]   = useState(false);  // icon-only on desktop

    const ActiveTab = TAB_COMPONENTS[activeTab] || null;

    const handleTabClick = (id) => {
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
                activeTab={activeTab} 
                onTabClick={handleTabClick} 
                mobileOpen={mobileOpen} 
                setMobileOpen={setMobileOpen} 
                collapsed={collapsed} 
                setCollapsed={setCollapsed} 
            />

            {/* ── Main area ── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Top bar */}
                <Topbar activeTab={activeTab} setMobileOpen={setMobileOpen} />

                {/* Tab content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {ActiveTab && <ActiveTab />}
                </main>
            </div>
        </div>
    );
});
