const productionApiUrl = 'https://alnajjar-web.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

// Production builds always use the deployed API, even if Vercel has a stale
// VITE_API_URL override. Local development can still use a configured API URL.
const apiUrl = import.meta.env.PROD ? productionApiUrl : configuredApiUrl || productionApiUrl;

export const API_BASE_URL = apiUrl.replace(/\/+$/, '');
