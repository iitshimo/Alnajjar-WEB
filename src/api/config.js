const productionApiUrl = 'https://alnajjar-web.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const configuredUrlIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(configuredApiUrl || '');
const configuredUrlIsStale = /^https?:\/\/alnajjar-backend\.onrender\.com(?::\d+)?(?:\/|$)/i.test(configuredApiUrl || '');

// Loopback and retired Render URLs must never override the production service.
const apiUrl = import.meta.env.PROD && (configuredUrlIsLocal || configuredUrlIsStale)
    ? productionApiUrl
    : configuredApiUrl || productionApiUrl;

export const API_BASE_URL = apiUrl.replace(/\/+$/, '');
