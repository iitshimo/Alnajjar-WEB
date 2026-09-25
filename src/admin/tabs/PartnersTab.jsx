import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import PartnerModal from '../components/modals/PartnerModal.jsx';

// ─── Partners Tab ─────────────────────────────────────────────────────────────
export default function PartnersTab() {
    const { partnersSettings, updatePartnersSettings, addPartner, updatePartner, deletePartner, resetPartners } = useAdmin();
    const { t, lang } = useLang();
    const [modal, setModal] = useState(null);
    const [saved, setSaved] = useState(false);

    const mode = partnersSettings?.mode || 'grid';
    const items = partnersSettings?.items || [];

    const setMode = (m) => {
        updatePartnersSettings({ mode: m });
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
    };

    const handleSavePartner = (form) => {
        modal?.id ? updatePartner(modal.id, form) : addPartner(form);
    };

    const modeOptions = [
        { id: 'grid',   label: 'Grid',   icon: 'grid_view',      desc: 'Static grid layout'   },
        { id: 'slider', label: 'Slider', icon: 'view_carousel',  desc: 'Auto-scrolling carousel' },
    ];

    return (
        <>
            <div className="max-w-3xl flex flex-col gap-6 pb-12">

                {/* ── Display Mode ── */}
                <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-white/7">
                        <h2 className="text-[14px] font-black text-white">Display Mode</h2>
                        <p className="text-[11px] text-zinc-500 mt-0.5">How partners are displayed on the public site</p>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                        {modeOptions.map(opt => (
                            <button key={opt.id} onClick={() => setMode(opt.id)}
                                className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all duration-200 ${mode === opt.id ? 'border-brand bg-brand/10 text-brand' : 'border-white/8 bg-white/2 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}>
                                <span className="material-icons text-[26px]">{opt.icon}</span>
                                <div className="text-center">
                                    <p className="text-[13px] font-black">{opt.label}</p>
                                    <p className="text-[10px] opacity-70 mt-0.5">{opt.desc}</p>
                                </div>
                                {mode === opt.id && <span className="text-[9px] font-black bg-brand text-black px-2 py-0.5 rounded-full">ACTIVE</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Partners List ── */}
                <div className="bg-[#18181b] border border-white/7 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-white/7 flex items-center justify-between gap-3 bg-white/2">
                        <div className="min-w-0">
                            <h2 className="text-[14px] font-black text-white">Brand Partners</h2>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{items.length} brands integrated</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={resetPartners} className="w-9 h-9 rounded-xl bg-white/4 hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors" title="Reset">
                                <span className="material-icons text-[18px]">restart_alt</span>
                            </button>
                            <button onClick={() => setModal({})} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand/80 text-[12px] font-black text-black transition-colors shadow-lg shadow-brand/20">
                                <span className="material-icons text-[16px]">add</span>
                                <span>Add Brand</span>
                            </button>
                        </div>
                    </div>
                    <div className="p-4">
                        {items.length === 0 ? (
                            <div className="text-center py-12 text-zinc-600">
                                <span className="material-icons text-4xl block mb-2 opacity-20">handshake</span>
                                <p className="text-[13px]">No partners yet. Tap "Add Brand".</p>
                            </div>
                        ) : (
                            <>
                                {/* Preview */}
                                <div className="mb-6 p-4 bg-[#0f0f12] rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Live Site Preview ({mode})</p>
                                    <div className={mode === 'grid' ? 'grid grid-cols-4 sm:grid-cols-6 gap-3' : 'flex gap-3 overflow-x-auto pb-2 scrollbar-none'}>
                                        {items.map(p => (
                                            <div key={p.id} className="shrink-0 bg-white rounded-xl p-2 flex items-center justify-center h-12 w-20 border border-zinc-100">
                                                <img src={p.img} alt={p.name?.[lang] || p.name?.en} className="h-8 w-auto max-w-full object-contain" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Partner rows */}
                                <div className="flex flex-col gap-2.5">
                                    {items.map(p => (
                                        <div key={p.id} className="flex items-center gap-3 px-4 py-3.5 bg-[#111113] rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-zinc-100">
                                                <img src={p.img} alt="" className="h-8 w-auto max-w-[36px] object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-black text-white truncate">{p.name?.[lang] || p.name?.en || 'Unnamed Partner'}</p>
                                                <p className="text-[10px] text-zinc-600 truncate opacity-60">
                                                    {p.img?.startsWith('data:') ? 'Custom Upload' : p.img}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setModal(p)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand/20 hover:text-brand flex items-center justify-center text-zinc-400 transition-colors">
                                                    <span className="material-icons text-[16px]">edit</span>
                                                </button>
                                                <button onClick={() => deletePartner(p.id)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-zinc-400 transition-colors">
                                                    <span className="material-icons text-[16px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {modal !== null && (
                <PartnerModal
                    partner={modal?.id ? modal : null}
                    onSave={handleSavePartner}
                    onClose={() => setModal(null)}
                />
            )}
        </>
    );
}
