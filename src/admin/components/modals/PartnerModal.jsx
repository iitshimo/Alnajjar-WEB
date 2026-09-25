import { useState, useRef, useCallback } from 'react';
import { useLang } from '../../../context/LanguageContext.jsx';

const fileToBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
});

export default function PartnerModal({ partner, onSave, onClose }) {
    const { lang } = useLang();
    const isEdit = !!partner?.id;
    const [form, setForm] = useState(partner || { img: '' });
    const [urlMode, setUrlMode] = useState(!partner?.img?.startsWith('data:'));
    const fileInputRef = useRef(null);

    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const b64 = await fileToBase64(file);
        setForm(f => ({ ...f, img: b64 }));
        setUrlMode(false);
        e.target.value = '';
    }, []);


    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[#18181b] border border-white/9 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Handle bar (mobile) */}
                <div className="flex justify-center pt-3 pb-0 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-white/10" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/7">
                    <div className="flex items-center gap-2">
                        <span className="material-icons text-brand text-[18px]">{isEdit ? 'edit' : 'add_circle'}</span>
                        <h3 className="text-[15px] font-black text-white">{isEdit ? 'Edit Partner' : 'Add Partner'}</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/6 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                        <span className="material-icons text-[17px]">close</span>
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-5">


                    {/* Logo / Image */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Partner Logo</label>

                        {/* Toggle: Upload vs URL */}
                        <div className="flex bg-[#0f0f12] border border-white/8 rounded-xl p-1 gap-1">
                            <button
                                type="button"
                                onClick={() => setUrlMode(false)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${!urlMode ? 'bg-brand text-black' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <span className="material-icons text-[14px]">upload_file</span>
                                Upload
                            </button>
                            <button
                                type="button"
                                onClick={() => setUrlMode(true)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${urlMode ? 'bg-brand text-black' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <span className="material-icons text-[14px]">link</span>
                                URL
                            </button>
                        </div>

                        {!urlMode ? (
                            <div
                                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/10 hover:border-brand/40 rounded-xl py-6 cursor-pointer transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {form.img && !form.img.startsWith('http') && !form.img.startsWith('/') ? (
                                    <img src={form.img} alt="" className="h-14 object-contain rounded-lg" />
                                ) : (
                                    <>
                                        <span className="material-icons text-zinc-600 text-[32px]">add_photo_alternate</span>
                                        <p className="text-[12px] text-zinc-500 font-semibold">Browse desktop</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={form.img}
                                onChange={e => setForm(f => ({ ...f, img: e.target.value }))}
                                placeholder="/Assets/Partners/logo.png..."
                                className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-brand/60"
                            />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-5 py-4 border-t border-white/7">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[13px] font-semibold text-zinc-300 transition-colors">Cancel</button>
                    <button
                        onClick={() => { onSave(form); onClose(); }}
                        className={`flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand/80 text-[13px] font-black text-black transition-colors`}
                    >
                        {isEdit ? 'Save Changes' : 'Add Partner'}
                    </button>
                </div>
            </div>
        </div>
    );
}
