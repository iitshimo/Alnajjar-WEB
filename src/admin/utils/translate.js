/**
 * Auto-translate using MyMemory free API (no key required).
 * Translates `text` from `sourceLang` to each of the target language codes.
 * Returns a map: { en: '...', ar: '...', ur: '...', zh: '...', ru: '...' }
 *
 * Lang codes for MyMemory: en, ar, ur, zh-CN, ru
 */

const MM_CODES = { en: 'en', ar: 'ar', ur: 'ur', zh: 'zh-CN', ru: 'ru', es: 'es' };

// Simple in-memory cache to avoid re-translating the same text
const cache = {};

async function translateOne(text, from, to) {
    if (from === to) return text;
    if (!text || !text.trim()) return '';
    const key = `${from}|${to}|${text}`;
    if (cache[key] !== undefined) return cache[key];

    try {
        const params = new URLSearchParams({
            q: text,
            langpair: `${MM_CODES[from] || from}|${MM_CODES[to] || to}`,
        });
        const res = await fetch(`https://api.mymemory.translated.net/get?${params}`);
        const json = await res.json();
        const translated = json?.responseData?.translatedText || text;
        cache[key] = translated;
        return translated;
    } catch {
        return text; // Fallback to original on error
    }
}

/**
 * Translate text from `sourceLang` to all other supported languages.
 * @param {string} text - The text to translate
 * @param {string} sourceLang - 'ar' | 'en' (the language the user typed in)
 * @param {function} onProgress - Called with partial results as each translation comes in
 * @returns {Promise<{ar, en, ur, zh, ru}>}
 */
export async function translateToAll(text, sourceLang, onProgress) {
    const targets = ['ar', 'en', 'ur', 'zh', 'ru', 'es'].filter(l => l !== sourceLang);
    const result = { [sourceLang]: text };

    await Promise.all(
        targets.map(async (targetLang) => {
            const translated = await translateOne(text, sourceLang, targetLang);
            result[targetLang] = translated;
            if (onProgress) onProgress({ ...result });
        })
    );

    return result;
}
