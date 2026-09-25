import React from 'react';

export function Button({ children, variant = 'primary', className = '', Icon = null, href, ...props }) {
    let baseCls = "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-300 font-bold ";
    if (variant === 'primary') {
        baseCls += "bg-brand text-black shadow-md shadow-brand/20 hover:brightness-[1.05] hover:shadow-md hover:shadow-brand/15 uppercase tracking-wider ";
    } else if (variant === 'outline') {
        baseCls += "border border-brand text-brand hover:bg-brand/5 ";
    }
    
    if (href) {
        return (
            <a href={href} className={`${baseCls} ${className}`} {...props}>
                {Icon && <span className="material-icons text-[18px] sm:text-[20px]">{Icon}</span>}
                {children}
            </a>
        );
    }
    
    return (
        <button className={`${baseCls} ${className}`} {...props}>
            {Icon && <span className="material-icons text-[18px] sm:text-[20px]">{Icon}</span>}
            {children}
        </button>
    );
}

export function SocialButton({ href, Icon, label, colorClass }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white text-[13px] font-bold hover:opacity-85 ${colorClass}`}>
            {Icon && <Icon />}
            <span>{label}</span>
        </a>
    );
}
