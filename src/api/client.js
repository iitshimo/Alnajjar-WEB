const API_URL = 'http://localhost:5000/api';

// ============================================
// PRODUCTS APIs
// ============================================

export async function getProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        return res.json();
    } catch (err) {
        console.error('Error fetching products:', err);
        return { success: false, data: [] };
    }
}

export async function getProductById(id) {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        return res.json();
    } catch (err) {
        console.error('Error fetching product:', err);
        return { success: false, data: null };
    }
}

export async function getProductsByCategory(categoryId) {
    try {
        const res = await fetch(`${API_URL}/products/category/${categoryId}`);
        return res.json();
    } catch (err) {
        console.error('Error fetching products by category:', err);
        return { success: false, data: [] };
    }
}

export async function createProduct(productData) {
    try {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        return res.json();
    } catch (err) {
        console.error('Error creating product:', err);
        return { success: false };
    }
}

export async function updateProduct(id, productData) {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        return res.json();
    } catch (err) {
        console.error('Error updating product:', err);
        return { success: false };
    }
}

export async function deleteProduct(id) {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    } catch (err) {
        console.error('Error deleting product:', err);
        return { success: false };
    }
}

// ============================================
// CATEGORIES APIs
// ============================================

export async function getCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`);
        return res.json();
    } catch (err) {
        console.error('Error fetching categories:', err);
        return { success: false, data: [] };
    }
}

export async function createCategory(categoryData) {
    try {
        const res = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });
        return res.json();
    } catch (err) {
        console.error('Error creating category:', err);
        return { success: false };
    }
}

// ============================================
// BRANCHES APIs
// ============================================

export async function getBranches() {
    try {
        const res = await fetch(`${API_URL}/branches`);
        return res.json();
    } catch (err) {
        console.error('Error fetching branches:', err);
        return { success: false, data: [] };
    }
}

export async function createBranch(branchData) {
    try {
        const res = await fetch(`${API_URL}/branches`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(branchData)
        });
        return res.json();
    } catch (err) {
        console.error('Error creating branch:', err);
        return { success: false };
    }
}

// ============================================
// ORDERS APIs
// ============================================

export async function getOrders() {
    try {
        const res = await fetch(`${API_URL}/orders`);
        return res.json();
    } catch (err) {
        console.error('Error fetching orders:', err);
        return { success: false, data: [] };
    }
}

export async function getOrderById(id) {
    try {
        const res = await fetch(`${API_URL}/orders/${id}`);
        return res.json();
    } catch (err) {
        console.error('Error fetching order:', err);
        return { success: false, data: null };
    }
}

export async function createOrder(orderData) {
    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return res.json();
    } catch (err) {
        console.error('Error creating order:', err);
        return { success: false };
    }
}

export async function updateOrderStatus(id, status) {
    try {
        const res = await fetch(`${API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return res.json();
    } catch (err) {
        console.error('Error updating order status:', err);
        return { success: false };
    }
}

// ============================================
// CONTACTS APIs
// ============================================

export async function getContacts() {
    try {
        const res = await fetch(`${API_URL}/contacts`);
        return res.json();
    } catch (err) {
        console.error('Error fetching contacts:', err);
        return { success: false, data: [] };
    }
}

export async function sendContact(contactData) {
    try {
        const res = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });
        return res.json();
    } catch (err) {
        console.error('Error sending contact:', err);
        return { success: false };
    }
}

// ============================================
// ADMIN APIs
// ============================================

export async function adminLogin(email, password) {
    try {
        const res = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return res.json();
    } catch (err) {
        console.error('Error logging in:', err);
        return { success: false };
    }
}