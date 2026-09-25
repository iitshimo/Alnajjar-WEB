import React from 'react';

export function Input({ label, error, className = '', dir = 'auto', icon, isRtl, ...props }) {
    const inputCls = `w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors duration-200 ${className}`;
    
    return (
        <div className="flex flex-col gap-1.5 w-full relative">
            {label && <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{label}</label>}
            {icon && (
                <span
                    className="material-icons absolute top-1/2 -translate-y-1/2 text-zinc-400 text-[18px] pointer-events-none"
                    style={{ [isRtl ? 'right' : 'left']: '14px', top: label ? '70%' : '50%' }}
                >
                    {icon}
                </span>
            )}
            <input 
                className={inputCls} 
                dir={dir} 
                style={icon ? { [isRtl ? 'paddingRight' : 'paddingLeft']: '44px', [isRtl ? 'paddingLeft' : 'paddingRight']: '16px' } : undefined}
                {...props} 
            />
        </div>
    );
}

export function Textarea({ label, error, className = '', dir = 'auto', ...props }) {
    const inputCls = `w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors duration-200 resize-y ${className}`;
    
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{label}</label>}
            <textarea className={inputCls} dir={dir} {...props} />
        </div>
    );
}
