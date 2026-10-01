const productionApiUrl = 'https://alnajjar-backend.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const configuredUrlIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(configuredApiUrl || '');

// A loopback URL only works on the developer's machine, never from a deployed site.
const apiUrl = import.meta.env.PROD && configuredUrlIsLocal
    ? productionApiUrl
    : configuredApiUrl || productionApiUrl;

export const API_BASE_URL = apiUrl.replace(/\/+$/, '');
