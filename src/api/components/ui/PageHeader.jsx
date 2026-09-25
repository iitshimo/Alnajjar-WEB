import React from 'react';

export function PageHeader({ subtitle, title, description, center = false, theme = 'light' }) {
    return (
        <div className={center ? "flex flex-col items-center text-center" : ""}>
            <div className={`flex items-center gap-3 mb-3 ${center ? "justify-center" : ""}`}>
                <span className="h-px w-8 bg-brand" />
                <span className="text-brand text-[10px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase">
                    {subtitle}
                </span>
                {center && <span className="h-px w-8 bg-brand" />}
            </div>
            {title && (
                <h1 className={`text-2xl sm:text-3xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                    {title}
                </h1>
            )}
            {description && (
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} ${center ? "max-w-md mx-auto" : "max-w-2xl"}`}>
                    {description}
                </p>
            )}
        </div>
    );
}
