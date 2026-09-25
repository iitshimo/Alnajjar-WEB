import { useState, useEffect, memo, useCallback } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useAdmin } from '../context/AdminContext.jsx';
import { Skeleton } from './ui/Skeleton.jsx';
import { PageHeader } from './ui/PageHeader.jsx';
import { Button, SocialButton } from './ui/Button.jsx';
import { Input, Textarea } from './ui/Input.jsx';
// ─── Brand SVG Icons ─────────────────────────────────────────────────────────
const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
);
const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
);
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const SkeletonRow = () => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
        <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-20 rounded-full" />
            <Skeleton className="h-3.5 w-36 rounded-full" />
        </div>
    </div>
);
const SkeletonSocial = ({ w = 'w-full' }) => (
    <Skeleton className={`${w} h-10 rounded-xl`} />
);
const SkeletonFormField = ({ half = false }) => (
    <div className={`${half ? 'flex-1' : 'w-full'} flex flex-col gap-1.5`}>
        <Skeleton className="h-2.5 w-16 rounded-full" />
        <Skeleton className="w-full h-10 rounded-xl" />
    </div>
);

// ─── Contact Row ──────────────────────────────────────────────────────────────
const ContactRow = memo(function ContactRow({ icon, accent, label, value, href, external, dir: textDir }) {
    const isRtl = document.documentElement.dir === 'rtl';
    const inner = (
        <div dir="ltr" className={`flex items-center gap-4 p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow delay-3000 ${href ? 'cursor-pointer' : 'cursor-default'}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                <span className="material-icons text-white text-[20px]">{icon}</span>
            </div>
            <div className={`min-w-0 flex-1 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p dir={textDir || 'auto'} className="text-zinc-800 text-sm font-semibold truncate">{value}</p>
            </div>
            {href && <span className="material-icons text-zinc-300 text-[18px] shrink-0 ml-auto">open_in_new</span>}
        </div>
    );
    if (href) return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="block">{inner}</a>;
    return inner;
});


// ─── Main ─────────────────────────────────────────────────────────────────────
export default memo(function Contact() {
    const { t, lang } = useLang();
    const { contactInfo } = useAdmin();
    const isRtl = t.dir === 'rtl';
    const c = t.contact;

    const [loaded, setLoaded] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    useEffect(() => {
        const id = setTimeout(() => setLoaded(true), 600);
        return () => clearTimeout(id);
    }, []);

    const setField = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        setSent(true);
        setTimeout(() => setSent(false), 3000);
    }, []);
    return (
        <section dir={isRtl ? 'rtl' : 'ltr'} className="bg-[#f7f6f4] min-h-screen">
            {/* Page Header */}
            <div className="bg-white border-b border-zinc-100">
                <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 text-center">
                    {!loaded ? (
                        <div className="flex flex-col items-center gap-3">
                            <Skeleton className="h-3 w-32 rounded-full" />
                            <Skeleton className="h-8 w-64 rounded-xl" />
                            <Skeleton className="h-3 w-80 rounded-full" />
                        </div>
                    ) : (
                        <>
                            <PageHeader 
                                center={true}
                                subtitle={c?.infoTitle}
                                title={c?.title}
                                description={c?.subtitle}
                            />                        </>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                {/* Left: Info + Social */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {!loaded ? (
                        <>
                            <div className="flex flex-col gap-3">
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </div>
                            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-2.5">
                                <Skeleton className="h-2.5 w-24 rounded-full mb-2" />
                                <SkeletonSocial />
                                <SkeletonSocial />
                                <SkeletonSocial />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3">
                                <ContactRow icon="phone" accent="bg-brand" label={c?.phoneLabel} value={contactInfo?.phone} href={`tel:${contactInfo?.phone}`} dir="ltr" />
                                <ContactRow icon="chat" accent="bg-[#25D366]" label={c?.whatsappLabel} value={contactInfo?.whatsapp} href={`https://wa.me/${contactInfo?.whatsapp?.replace(/\D/g, '')}`} external dir="ltr" />
                                <ContactRow icon="email" accent="bg-[#4285F4]" label={c?.emailLabel} value={contactInfo?.email} href={`mailto:${contactInfo?.email}`} />
                                <ContactRow icon="location_on" accent="bg-[#EA4335]" label={c?.addressTitle} value={(lang === 'ar' || lang === 'ur') ? (contactInfo?.addressAr || contactInfo?.address) : (contactInfo?.addressEn || contactInfo?.address)} href={contactInfo?.mapUrl} external />
                            </div>
                            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-4">{c?.socialLabel}</p>
                                <div className="flex flex-col gap-2.5">
                                    {contactInfo?.tiktok && <SocialButton href={contactInfo.tiktok} Icon={TikTokIcon} label="TikTok" colorClass="bg-[#010101]" />}
                                    {contactInfo?.instagram && <SocialButton href={contactInfo.instagram} Icon={InstagramIcon} label="Instagram" colorClass="bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />}
                                    {contactInfo?.facebook && <SocialButton href={contactInfo.facebook} Icon={FacebookIcon} label="Facebook" colorClass="bg-[#1877F2]" />}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
                    {!loaded ? (
                        <div className="flex flex-col gap-4">
                            <Skeleton className="h-6 w-40 rounded-xl" />
                            <div className="flex gap-4">
                                <SkeletonFormField half />
                                <SkeletonFormField half />
                            </div>
                            <SkeletonFormField />
                            <SkeletonFormField />
                            <div className="w-full flex flex-col gap-1.5">
                                <Skeleton className="h-2.5 w-16 rounded-full" />
                                <Skeleton className="w-full h-28 rounded-xl" />
                            </div>
                            <Skeleton className="w-full h-12 rounded-xl" />
                        </div>
                    ) : (
                        <>
                            <h2 className="text-lg font-black text-zinc-800 mb-6">{c?.formTitle}</h2>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label={c?.firstName} placeholder={c?.firstName} value={form.firstName} onChange={e => setField('firstName', e.target.value)} required />
                                    <Input label={c?.lastName} placeholder={c?.lastName} value={form.lastName} onChange={e => setField('lastName', e.target.value)} required />
                                </div>
                                <Input label={c?.phone} placeholder={c?.phone} value={form.phone} onChange={e => setField('phone', e.target.value)} dir="ltr" />
                                <Input label={c?.subject} placeholder={c?.subject} value={form.subject} onChange={e => setField('subject', e.target.value)} required />
                                <Textarea label={c?.message} placeholder={c?.message} value={form.message} onChange={e => setField('message', e.target.value)} required rows={5} />
                                <Button type="submit" variant="primary" className={`w-full py-3.5 text-sm ${sent ? '!bg-green-500 !text-white' : ''}`}>
                                    {sent
                                        ? <><span className="material-icons text-[18px]">check_circle</span> Sent!</>
                                        : <><span className="material-icons text-[18px]">send</span> {c?.submit}</>
                                    }
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Payments Section */}
            <div className="max-w-5xl mx-auto px-6 sm:px-10 pb-16">
                <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8 sm:p-10 text-center">
                    {!loaded ? (
                        <div className="flex flex-col items-center gap-6">
                            <Skeleton className="h-3 w-40 rounded-full" />
                            <div className="flex flex-wrap justify-center gap-6">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Skeleton key={i} className="w-16 h-10 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 justify-center mb-8">
                                <span className="h-px w-6 bg-zinc-200" />
                                <h2 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">{c?.paymentsTitle}</h2>
                                <span className="h-px w-6 bg-zinc-200" />
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-90 hover:opacity-100 transition-all duration-500">
                                <img src="/Assets/Payments/visa.webp" alt="Visa" className="h-6 sm:h-8 w-auto object-contain" />
                                <img src="/Assets/Payments/mster_card.webp" alt="MasterCard" className="h-8 sm:h-10 w-auto object-contain" />
                                <img src="/Assets/Payments/amercan_express.webp" alt="American Express" className="h-7 sm:h-9 w-auto object-contain" />
                                <img src="/Assets/Payments/tabby.webp" alt="Tabby" className="h-6 sm:h-8 w-auto object-contain" />
                                <img src="/Assets/Payments/tamara.webp" alt="Tamara" className="h-6 sm:h-8 w-auto object-contain" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
});
