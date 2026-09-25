import { memo } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import { TABS } from '../utils/constants.js';

export default memo(function Sidebar({ activeTab, onTabClick, mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
    const { products } = useAdmin();
    const { t } = useLang();

    return (
        <aside
            style={{ width: collapsed ? '68px' : '240px' }}
            className={[
                'fixed lg:relative inset-y-0 left-0 z-40 flex flex-col shrink-0',
                'bg-[#141418] border-r border-white/6',
                'transition-[width,transform] duration-300 ease-in-out',
                mobileOpen ? 'translate-x-0 shadow-2xl shadow-black/60' : '-translate-x-full',
                'lg:translate-x-0',
            ].join(' ')}
        >
            <div className="flex items-center h-14 px-3 border-b border-white/6 gap-3 shrink-0 overflow-hidden">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <img src="/Assets/Logo/logo.png" alt="" className="h-8 w-8 object-contain flex-shrink-0 rounded-lg" />
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-[12px] font-black text-white leading-tight truncate">{t.admin.sidebar.adminPortal}</p>
                            <p className="text-[9px] text-zinc-600 truncate leading-tight">Al Najjar Shop</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(v => !v)}
                    className="hidden lg:flex w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 items-center justify-center text-zinc-500 hover:text-white transition-colors shrink-0"
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <span className="material-icons text-[18px]">
                        {collapsed ? 'chevron_right' : 'chevron_left'}
                    </span>
                </button>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors shrink-0"
                >
                    <span className="material-icons text-[18px]">close</span>
                </button>
            </div>

            {!collapsed && (
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] px-4 pt-4 pb-2 flex-shrink-0">
                    {t.admin.sidebar.navigation}
                </p>
            )}

            <nav className="flex-1 px-2 pb-4 flex flex-col gap-0.5 overflow-y-auto mt-1">
                {TABS.map(tab => {
                    const isActive = tab.id === activeTab;
                    const localizedLabel = t.admin.sidebar[tab.id] || tab.label;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabClick(tab.id)}
                            title={collapsed ? localizedLabel : undefined}
                            className={[
                                'relative flex items-center gap-3 rounded-xl font-semibold text-[13px]',
                                'transition-all duration-150 w-full group',
                                collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5',
                                isActive
                                    ? 'bg-brand/15 text-brand'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5',
                            ].join(' ')}
                        >
                            {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand rounded-full" />}
                            <span className={`material-icons text-[20px] shrink-0 ${isActive ? 'text-brand' : ''}`}>
                                {tab.icon}
                            </span>
                            {!collapsed && <span className="truncate">{localizedLabel}</span>}
                            {collapsed && (
                                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#242428] border border-white/8 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                    {localizedLabel}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {!collapsed && (
                <div className="px-4 py-4 border-t border-white/6 shrink-0 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        <span className="text-[11px] text-zinc-500 truncate">localhost:5173</span>
                    </div>
                    <p className="text-[10px] text-zinc-700">{products.length} {t.admin.sidebar.products}</p>
                </div>
            )}
        </aside>
    );
});
