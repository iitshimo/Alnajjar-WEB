# Al-Najjar Shop

## About
Al-Najjar Shop is a comprehensive digital storefront and administrative panel for a premium supplier of ceramics, porcelain, and sanitary ware. The platform supports multiple languages (Arabic, English, Urdu, Chinese, Russian, Spanish), multiple currencies, dynamic routing, and includes a secure, built-in admin dashboard to manage products, categories, partners, branches, and site content.

## Tools Used
- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **State Management & Routing:** React Context API & Hash Router
- **Icons:** Material Icons

## How to Run

1. **Install Dependencies**
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   This will start the local server, typically at `http://localhost:5173`.

## Product API and MongoDB

The API is in `backend/` and requires the environment variables shown in `backend/.env.example`. It does not use a default database URL or admin password. For local development, copy that file to `backend/.env`, fill in the values, then in a separate terminal run:

```bash
cd backend
npm install
npm run dev
```

The API listens on `http://localhost:5000`. It allows browser requests from Vite at ports `5173` and `5174` by default. Product create, update, and delete operations require an admin bearer token; product listing is public. Site settings, including branches, are stored in MongoDB so changes are shared with visitors.

### Production deployment

1. Deploy `backend/` as a Node service. Configure `MONGODB_URI`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET` (at least 32 random characters), and `ALLOWED_ORIGINS` with the exact HTTPS site origins, separated by commas. Keep these values in the hosting provider's secret environment settings.
2. Set the frontend build variable `VITE_API_URL` to the backend API base, for example `https://your-api-host.example.com/api`, then deploy the Vite project to Vercel.
3. The Vercel rewrite serves the app routes from `index.html`; the admin sign-in URL is `/alnajjar-root`.
4. After deployment, check `https://your-api-host.example.com/api/health` reports `database: "connected"`, then sign in with the configured admin credentials.

The browser-only admin password has been removed. Production requires these backend secrets, MongoDB, allowed site origins, and the frontend API URL to be configured as described above.

### Verify product persistence

1. Confirm the backend terminal prints `MongoDB connected successfully` and `API server listening on port 5000`.
2. Confirm `http://localhost:5000/api/health` returns `service: "al-najjar-api"` and `database: "connected"`.
3. Confirm `http://localhost:5000/api/products` returns `{ "success": true, "data": [...] }`.
4. Open the frontend and visit `/#/products`; the browser console logs `✅ Products loaded from API: [...]`.
5. Open `/alnajjar-root`, sign in with the configured admin credentials, then add, edit, and delete a product. Each write requires a valid server-issued admin token.
6. Confirm the document changes in MongoDB Compass under database `alnajjar`, collection `products`.
7. Reload the storefront and admin page. Both fetch the saved products again from MongoDB.

To use another MongoDB URI or API port, set `MONGODB_URI` or `PORT` before starting the backend.
