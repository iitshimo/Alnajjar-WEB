import { useRef, useState } from 'react';
import { translateToAll } from '../utils/translate.js';

/**
 * Reusable hook for handling debounced auto-translation across multiple languages.
 * @param {Object} options
 * @param {number} options.delay - Debounce delay in ms (default 600)
 * @returns {Object} { translating, transLang, triggerTranslate }
 */
export function useAutoTranslate({ delay = 600 } = {}) {
    const [translating, setTranslating] = useState(false);
    const [transLang, setTransLang] = useState(null);
    const timerRef = useRef(null);

    const triggerTranslate = (text, lang, onUpdate) => {
        // Only translate from Arabic or English
        if (lang !== 'ar' && lang !== 'en') return;
        
        clearTimeout(timerRef.current);
        if (!text || !text.trim()) return;

        timerRef.current = setTimeout(async () => {
            setTranslating(true);
            setTransLang(lang);
            try {
                // translateToAll returns { en, ar, ur, zh, ru, es }
                const result = await translateToAll(text, lang, (partial) => {
                    if (onUpdate) onUpdate(prev => ({ ...prev, ...partial }));
                });
                if (onUpdate) onUpdate(prev => ({ ...prev, ...result }));
            } finally {
                setTranslating(false);
                setTransLang(null);
            }
        }, delay);
    };

    return { translating, transLang, triggerTranslate };
}
