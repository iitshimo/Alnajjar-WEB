export default function DeleteConfirm({ product, onConfirm, onCancel, deleting = false, error = '' }) {
    const name = product?.name?.en || product?.name?.ar || 'this product';
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => { if (!deleting) onCancel(); }}>
            <div className="bg-[#1c1c1f] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons text-red-400 text-[24px]">delete_forever</span>
                </div>
                <h3 className="text-[15px] font-black text-white text-center mb-2">Delete Product?</h3>
                <p className="text-[13px] text-zinc-400 text-center mb-6">"<span className="text-white">{name}</span>" will be permanently removed.</p>
                {error && <p role="alert" className="text-[12px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4 break-words">Delete failed: {error}</p>}
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-[13px] font-semibold text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                    <button onClick={onConfirm} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-[13px] font-black text-white transition-colors disabled:opacity-70 disabled:cursor-wait">
                        {deleting ? <span className="inline-flex items-center justify-center gap-2"><span className="material-icons text-[16px] animate-spin">refresh</span>Deleting...</span> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}


