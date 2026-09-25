import React from 'react';

const shimmerStyle = {
    background: 'linear-gradient(90deg, #e8e5e0 25%, #f2efea 50%, #e8e5e0 75%)',
    backgroundSize: '400px 100%',
    animation: 'ui-shimmer 1.4s infinite linear',
};

const injectStyle = () => {
    if (typeof document !== 'undefined' && !document.getElementById('ui-shimmer-style')) {
        const style = document.createElement('style');
        style.id = 'ui-shimmer-style';
        style.innerHTML = `@keyframes ui-shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }`;
        document.head.appendChild(style);
    }
};

export function Skeleton({ className = '', style = {}, ...props }) {
    injectStyle();
    return (
        <div 
            className={className} 
            style={{ ...shimmerStyle, ...style }} 
            {...props} 
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <Skeleton className="w-full h-44 rounded-t-2xl" />
            <div className="p-4 flex flex-col gap-3">
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-3 w-1/2 rounded-full" />
            </div>
        </div>
    );
}
