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

The API is in `backend/` and connects to `mongodb://localhost:27017/alnajjar` by default. Start MongoDB, then in a separate terminal run:

```bash
cd backend
npm install
npm run dev
```

The API listens on `http://localhost:5000`. It allows browser requests from Vite at ports `5173` and `5174`. Start the frontend in another terminal with `npm run dev`. Product create, update, delete, and list operations use MongoDB; product state is not stored in localStorage.

### Verify product persistence

1. Confirm the backend terminal prints `MongoDB connected successfully` and `API server listening on http://localhost:5000`.
2. Confirm `http://localhost:5000/api/health` returns `service: "al-najjar-products-api"`, `database: "connected"`, and lists GET/POST/PUT/DELETE routes. If it returns a different response or DELETE requests say `Cannot DELETE`, another or stale server is using port 5000; stop that server and restart this backend.
3. Confirm `http://localhost:5000/api/products` returns `{ "success": true, "data": [...] }`.
4. Open the frontend and visit `/#/products`; the browser console logs `✅ Products loaded from API: [...]`.
5. Open `/alnajjar-root`, sign in, add, edit, and delete a product. Each operation updates the admin list only after the MongoDB API succeeds.
6. Confirm the document changes in MongoDB Compass under database `alnajjar`, collection `products`.
7. Reload the storefront and admin page. Both fetch the saved products again from MongoDB.

To use another MongoDB URI or API port, set `MONGODB_URI` or `PORT` before starting the backend.
