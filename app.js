/**
 * SABAY STORE - CORE APPLICATION LOGIC
 * Includes Data Management, Auth, and Admin Dashboard
 */

// =============================================
//  1. DATA MANAGEMENT (Storage Service)
// =============================================
const Storage = {
    keys: {
        PRODUCTS: 'sabay_products',
        USERS: 'sabay_users',
        ORDERS: 'sabay_orders',
        CART: 'sabay_cart',
        SESSION: 'sabay_session',
        POSTS: 'sabay_posts',
        NOTIFICATIONS: 'sabay_notifications'
    },

    init() {
        if (!localStorage.getItem(this.keys.PRODUCTS)) {
            localStorage.setItem(this.keys.PRODUCTS, JSON.stringify([
                { id: '1', name: 'Premium Wireless Headphones', price: 299.99, category: 'Audio', stock: 42, image: 'images/headphones.png' },
                { id: '2', name: 'Pro Smartwatch Series X', price: 399.00, category: 'Wearables', stock: 7, image: 'images/smartwatch.png' },
                { id: '3', name: 'Alpha Mirrorless Camera', price: 1299.00, category: 'Photography', stock: 18, image: 'images/camera.png' },
                { id: '4', name: 'UltraThin Studio Laptop', price: 1499.99, category: 'Computers', stock: 0, image: 'images/laptop.png' }
            ]));
        }
        if (!localStorage.getItem(this.keys.USERS)) {
            localStorage.setItem(this.keys.USERS, JSON.stringify([
                { id: '1', name: 'Admin Super', email: 'admin@sabay.com', password: 'admin1234', role: 'admin', joined: 'Jan 01, 2026' },
                { id: '2', name: 'Sophal Rith', email: 'user@sabay.com', password: 'user1234', role: 'user', joined: 'Apr 10, 2026' }
            ]));
        }
        if (!localStorage.getItem(this.keys.ORDERS)) {
            localStorage.setItem(this.keys.ORDERS, JSON.stringify([
                { id: 'ORD-101', customer: 'Sophal Rith', items: 2, total: 698.99, date: 'Apr 25, 2026', status: 'Completed' }
            ]));
        }
        if (!localStorage.getItem(this.keys.POSTS)) {
            localStorage.setItem(this.keys.POSTS, JSON.stringify([
                { 
                    id: 'p1', 
                    userId: '1', 
                    userName: 'Admin Super', 
                    userAvatar: 'fas fa-user-shield',
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000', 
                    caption: 'Check out these new wireless headphones! Best sound quality ever. 🎧', 
                    likes: ['2'], 
                    comments: [
                        { id: 'c1', userId: '2', userName: 'Sophal Rith', text: 'Wow, looks amazing! How much?', date: 'Apr 25, 2026' }
                    ],
                    date: 'Apr 25, 2026' 
                }
            ]));
        }
        if (!localStorage.getItem(this.keys.NOTIFICATIONS)) {
            localStorage.setItem(this.keys.NOTIFICATIONS, JSON.stringify([
                { id: 'n1', targetUserId: '1', fromUserName: 'Sophal Rith', type: 'comment', postId: 'p1', text: 'commented on your post', read: false, date: 'Apr 25, 2026' }
            ]));
        }
    },

    getData(key) { return JSON.parse(localStorage.getItem(key)) || []; },
    setData(key, data) { localStorage.setItem(key, JSON.stringify(data)); },

    getSession() { return JSON.parse(localStorage.getItem(this.keys.SESSION)); },
    setSession(user) { localStorage.setItem(this.keys.SESSION, JSON.stringify(user)); },
    logout() { localStorage.removeItem(this.keys.SESSION); window.location.href = 'login.html'; }
};

Storage.init();

// =============================================
//  2. UI NOTIFICATIONS (Toast)
// =============================================
const Toast = {
    show(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
    }
};

// =============================================
//  3. AUTH LOGIC
// =============================================
function initAuth() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const roleToggle = document.getElementById('role-toggle');
    let currentRole = 'user';

    if (roleToggle) {
        roleToggle.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                roleToggle.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentRole = btn.dataset.role;
                document.querySelector('.auth-submit-btn').classList.toggle('admin-mode', currentRole === 'admin');
            });
        });
    }

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const users = Storage.getData(Storage.keys.USERS);
        const user = users.find(u => u.email === email && u.password === pass && u.role === currentRole);

        if (user) {
            Storage.setSession(user);
            Toast.show(`Welcome back, ${user.name}!`);
            setTimeout(() => { window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'store.html'; }, 800);
        } else {
            const error = document.getElementById('auth-error');
            error.textContent = 'Invalid email, password, or role.';
            error.style.display = 'block';
        }
    });
}

// =============================================
//  4. ADMIN DASHBOARD LOGIC
// =============================================
let currentEditType = null;

function initAdmin() {
    const adminBody = document.querySelector('.admin-body');
    if (!adminBody) return;

    const session = Storage.getSession();
    if (!session || session.role !== 'admin') { window.location.href = 'login.html'; return; }

    document.getElementById('admin-display-name').textContent = session.name;

    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('admin-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            sidebar.classList.toggle('collapsed');
            document.querySelector('.admin-main').classList.toggle('expanded');
        });
    }

    const navLinks = document.querySelectorAll('.sidebar-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const sectionId = link.dataset.section;
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            document.getElementById(`section-${sectionId}`).classList.add('active');
            document.getElementById('topbar-title').textContent = link.querySelector('span').textContent;
            renderAdminSection(sectionId);
        });
    });

    document.getElementById('admin-form').addEventListener('submit', handleAdminSubmit);
    renderAdminSection('overview');
}

function renderAdminSection(section) {
    if (section === 'overview') {
        const users = Storage.getData(Storage.keys.USERS);
        const orders = Storage.getData(Storage.keys.ORDERS);
        const products = Storage.getData(Storage.keys.PRODUCTS);
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);

        document.querySelector('.card-blue .stat-value').textContent = users.length;
        document.querySelector('.card-green .stat-value').textContent = orders.length;
        document.querySelector('.card-purple .stat-value').textContent = `$${revenue.toLocaleString()}`;
        document.querySelector('.card-orange .stat-value').textContent = products.length;

        const recentOrdersTbody = document.querySelector('#recent-orders-table tbody');
        recentOrdersTbody.innerHTML = orders.slice(-4).reverse().map(o => `
            <tr>
                <td>${o.id}</td>
                <td>${o.customer}</td>
                <td>$${o.total}</td>
                <td><span class="badge badge-success">${o.status}</span></td>
            </tr>
        `).join('');
    } else {
        renderTable(section);
    }
}

function renderTable(type) {
    const key = Storage.keys[type.toUpperCase()];
    const data = Storage.getData(key);
    const tbody = document.querySelector(`#section-${type} tbody`);
    if (!tbody) return;

    tbody.innerHTML = data.map(item => {
        if (type === 'products') {
            return `<tr>
                <td><img src="${item.image}" class="table-product-img"></td>
                <td>${item.name}</td>
                <td>$${item.price}</td>
                <td><span class="badge ${item.stock > 0 ? 'badge-success' : 'badge-danger'}">${item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}</span></td>
                <td class="action-btns">
                    <button class="icon-btn edit-btn" onclick="openModal('products', '${item.id}')"><i class="fas fa-pen"></i></button>
                    <button class="icon-btn delete-btn" onclick="deleteItem('products', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }
        if (type === 'users') {
            return `<tr>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td><span class="badge ${item.role === 'admin' ? 'badge-purple' : 'badge-blue'}">${item.role}</span></td>
                <td>${item.joined}</td>
                <td class="action-btns">
                    <button class="icon-btn delete-btn" onclick="deleteItem('users', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }
        if (type === 'orders') {
            return `<tr>
                <td>${item.id}</td>
                <td>${item.customer}</td>
                <td>${item.items}</td>
                <td>$${item.total}</td>
                <td>${item.date}</td>
                <td><span class="badge badge-success">${item.status}</span></td>
            </tr>`;
        }
        if (type === 'posts') {
            return `<tr>
                <td><b>${item.userName}</b></td>
                <td><div style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.caption}</div></td>
                <td>${item.likes.length} Likes, ${item.comments.length} Comments</td>
                <td>${item.date}</td>
                <td class="action-btns">
                    <button class="icon-btn delete-btn" onclick="deleteItem('posts', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }
        return '';
    }).join('');
}

window.openModal = (type, id = null) => {
    currentEditType = type;
    const modal = document.getElementById('admin-modal');
    const fields = document.getElementById('modal-fields');
    const title = document.getElementById('modal-title');
    const editId = document.getElementById('edit-id');
    
    editId.value = id || '';
    title.textContent = id ? `Edit ${type.slice(0, -1)}` : `Add ${type.slice(0, -1)}`;
    
    const key = Storage.keys[type.toUpperCase()];
    const item = id ? Storage.getData(key).find(i => i.id === id) : null;

    if (type === 'products') {
        fields.innerHTML = `
            <div class="form-group"><label>Product Name</label><input type="text" id="p-name" value="${item ? item.name : ''}" required></div>
            <div class="form-group"><label>Price ($)</label><input type="number" step="0.01" id="p-price" value="${item ? item.price : ''}" required></div>
            <div class="form-group"><label>Category</label><input type="text" id="p-cat" value="${item ? item.category : ''}" required></div>
            <div class="form-group"><label>Stock</label><input type="number" id="p-stock" value="${item ? item.stock : ''}" required></div>
            <div class="form-group"><label>Image URL</label><input type="text" id="p-img" value="${item ? item.image : 'images/headphones.png'}"></div>
        `;
    }
    modal.classList.add('active');
};

window.closeModal = () => document.getElementById('admin-modal').classList.remove('active');

function handleAdminSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const key = Storage.keys[currentEditType.toUpperCase()];
    let data = Storage.getData(key);

    let newItem = { id: id || Date.now().toString() };

    if (currentEditType === 'products') {
        newItem = { ...newItem, 
            name: document.getElementById('p-name').value,
            price: parseFloat(document.getElementById('p-price').value),
            category: document.getElementById('p-cat').value,
            stock: parseInt(document.getElementById('p-stock').value),
            image: document.getElementById('p-img').value
        };
    }

    if (id) {
        data = data.map(i => i.id === id ? newItem : i);
    } else {
        data.push(newItem);
    }

    Storage.setData(key, data);
    Toast.show(`${currentEditType.slice(0, -1)} saved!`);
    closeModal();
    renderAdminSection(currentEditType);
    if (currentEditType === 'orders') renderAdminSection('overview');
}

window.deleteItem = (type, id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    const key = Storage.keys[type.toUpperCase()];
    Storage.setData(key, Storage.getData(key).filter(i => i.id !== id));
    Toast.show('Item deleted');
    renderAdminSection(type);
};

// =============================================
//  5. STORE LOGIC
// =============================================
function initStore() {
    if (!document.querySelector('.store-body')) return;
    renderStoreProducts();

    document.querySelectorAll('.store-links a').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.store-links a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            renderStoreProducts(link.textContent);
        });
    });
}

function renderStoreProducts(filter = 'Shop All') {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;
    const products = Storage.getData(Storage.keys.PRODUCTS);
    const filtered = filter === 'Shop All' ? products : products.filter(p => p.category === filter);

    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <div class="product-image">
                <img src="${p.image}" alt="${p.name}">
                ${p.stock === 0 ? '<span class="out-of-stock-tag">Out of Stock</span>' : ''}
            </div>
            <div class="product-info">
                <span class="product-category">${p.category}</span>
                <h3 class="product-title">${p.name}</h3>
                <div class="product-footer">
                    <span class="product-price">$${p.price}</span>
                    <button class="add-to-cart-btn" onclick="addToCart('${p.id}')" ${p.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// =============================================
//  6. CART LOGIC
// =============================================
let cart = JSON.parse(localStorage.getItem(Storage.keys.CART)) || [];

window.addToCart = (id) => {
    const product = Storage.getData(Storage.keys.PRODUCTS).find(p => p.id === id);
    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity++; else cart.push({ ...product, quantity: 1 });
    updateCart();
    Toast.show(`${product.name} added to cart`);
    document.getElementById('cart-sidebar').classList.add('open');
};

function updateCart() {
    localStorage.setItem(Storage.keys.CART, JSON.stringify(cart));
    const items = document.getElementById('cart-items');
    if (!items) return;

    items.innerHTML = cart.length === 0 ? '<div class="empty-cart-message">Your cart is empty.</div>' : cart.map((i, idx) => `
        <div class="cart-item">
            <img src="${i.image}">
            <div class="cart-item-info"><h4>${i.name}</h4><p>$${i.price} (x${i.quantity})</p></div>
            <div class="cart-item-remove" onclick="removeFromCart(${idx})"><i class="fas fa-trash"></i></div>
        </div>
    `).join('');

    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    document.getElementById('cart-total-price').textContent = `$${total.toFixed(2)}`;
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = cart.reduce((s, i) => s + i.quantity, 0));
}

window.removeFromCart = (idx) => { cart.splice(idx, 1); updateCart(); };

document.querySelector('.checkout-btn')?.addEventListener('click', () => {
    if (cart.length === 0) return;
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const orders = Storage.getData(Storage.keys.ORDERS);
    orders.push({
        id: 'ORD-' + Math.floor(100 + Math.random() * 900),
        customer: Storage.getSession()?.name || 'Guest User',
        items: cart.reduce((s, i) => s + i.quantity, 0),
        total: parseFloat(total.toFixed(2)),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '4-digit' }),
        status: 'Completed'
    });
    Storage.setData(Storage.keys.ORDERS, orders);
    cart = [];
    updateCart();
    Toast.show('Order placed successfully!');
    document.getElementById('cart-sidebar').classList.remove('open');
});

// =============================================
//  8. COMMUNITY & NOTIFICATIONS LOGIC
// =============================================

function initCommunity() {
    if (!document.querySelector('.store-body')) return;

    // Page Switching Logic
    document.querySelectorAll('.store-links a[data-page]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const page = link.dataset.page;
            document.querySelectorAll('.store-links a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            document.querySelectorAll('.store-page').forEach(p => p.classList.remove('active'));
            document.getElementById(`page-${page}`).classList.add('active');

            if (page === 'community') renderFeed();
            if (page === 'shop') renderStoreProducts();
        });
    });

    // Notification Dropdown Toggle
    const notifToggle = document.getElementById('notification-toggle');
    if (notifToggle) {
        notifToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('notification-dropdown');
            dropdown.classList.toggle('active');
            if (dropdown.classList.contains('active')) markNotificationsRead();
        });
    }

    document.addEventListener('click', () => {
        document.getElementById('notification-dropdown')?.classList.remove('active');
    });

    document.getElementById('post-form')?.addEventListener('submit', handlePostSubmit);
    
    renderNotifications();
    updateNotificationBadge();
}

// Post Management
window.openPostModal = () => {
    if (!Storage.getSession()) {
        Toast.show('Please login to post', 'error');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    document.getElementById('post-modal').classList.add('active');
};
window.closePostModal = () => document.getElementById('post-modal').classList.remove('active');

function handlePostSubmit(e) {
    e.preventDefault();
    const session = Storage.getSession();
    const imageUrl = document.getElementById('post-image-url').value;
    const caption = document.getElementById('post-caption').value;

    const posts = Storage.getData(Storage.keys.POSTS);
    const newPost = {
        id: 'p' + Date.now(),
        userId: session.id,
        userName: session.name,
        userAvatar: session.role === 'admin' ? 'fas fa-user-shield' : 'fas fa-user',
        image: imageUrl,
        caption: caption,
        likes: [],
        comments: [],
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '4-digit' })
    };

    posts.unshift(newPost);
    Storage.setData(Storage.keys.POSTS, posts);
    
    Toast.show('Post shared successfully!');
    closePostModal();
    renderFeed();
    e.target.reset();
}

function renderFeed() {
    const feed = document.getElementById('community-feed');
    if (!feed) return;

    const posts = Storage.getData(Storage.keys.POSTS);
    const session = Storage.getSession();

    feed.innerHTML = posts.map(post => {
        const isLiked = session && post.likes.includes(session.id);
        return `
            <div class="post-card" id="post-${post.id}">
                <div class="post-header">
                    <div class="post-user-avatar"><i class="${post.userAvatar}"></i></div>
                    <div class="post-user-info">
                        <h4>${post.userName}</h4>
                        <span>${post.date}</span>
                    </div>
                </div>
                <div class="post-caption">${post.caption}</div>
                <div class="post-image-container">
                    <img src="${post.image}" alt="Post image">
                </div>
                <div class="post-actions">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="likePost('${post.id}')">
                        <i class="${isLiked ? 'fas' : 'far'} fa-thumbs-up"></i> 
                        <span>${post.likes.length} Likes</span>
                    </button>
                    <button class="action-btn">
                        <i class="far fa-comment"></i> 
                        <span>${post.comments.length} Comments</span>
                    </button>
                </div>
                <div class="post-comments-section">
                    <div class="comment-list">
                        ${post.comments.map(c => `
                            <div class="comment-item">
                                <div class="comment-avatar"><i class="fas fa-user"></i></div>
                                <div class="comment-content">
                                    <h5>${c.userName}</h5>
                                    <p>${c.text}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="comment-input-wrapper">
                        <input type="text" class="comment-input" placeholder="Write a comment..." onkeypress="if(event.key==='Enter') addComment('${post.id}', this.value)">
                        <button class="comment-submit-btn" onclick="const input=this.previousElementSibling; addComment('${post.id}', input.value); input.value='';"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Interactions
window.likePost = (postId) => {
    const session = Storage.getSession();
    if (!session) return Toast.show('Please login to like', 'error');

    let posts = Storage.getData(Storage.keys.POSTS);
    const post = posts.find(p => p.id === postId);
    
    if (post.likes.includes(session.id)) {
        post.likes = post.likes.filter(id => id !== session.id);
    } else {
        post.likes.push(session.id);
        // Create notification for post owner
        if (post.userId !== session.id) {
            createNotification(post.userId, session.name, 'like', postId, 'liked your post');
        }
    }

    Storage.setData(Storage.keys.POSTS, posts);
    renderFeed();
};

window.addComment = (postId, text) => {
    if (!text.trim()) return;
    const session = Storage.getSession();
    if (!session) return Toast.show('Please login to comment', 'error');

    let posts = Storage.getData(Storage.keys.POSTS);
    const post = posts.find(p => p.id === postId);
    
    post.comments.push({
        id: 'c' + Date.now(),
        userId: session.id,
        userName: session.name,
        text: text,
        date: new Date().toLocaleDateString()
    });

    // Create notification for post owner
    if (post.userId !== session.id) {
        createNotification(post.userId, session.name, 'comment', postId, `commented: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`);
    }

    Storage.setData(Storage.keys.POSTS, posts);
    renderFeed();
};

// Notifications Logic
function createNotification(targetUserId, fromUserName, type, postId, text) {
    const notifications = Storage.getData(Storage.keys.NOTIFICATIONS);
    notifications.unshift({
        id: 'n' + Date.now(),
        targetUserId,
        fromUserName,
        type,
        postId,
        text,
        read: false,
        date: 'Just now'
    });
    Storage.setData(Storage.keys.NOTIFICATIONS, notifications);
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const session = Storage.getSession();
    if (!session) return;
    const notifications = Storage.getData(Storage.keys.NOTIFICATIONS);
    const unreadCount = notifications.filter(n => n.targetUserId === session.id && !n.read).length;
    
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.classList.toggle('active', unreadCount > 0);
    }
}

function renderNotifications() {
    const list = document.getElementById('notif-list');
    const session = Storage.getSession();
    if (!list || !session) return;

    const notifications = Storage.getData(Storage.keys.NOTIFICATIONS).filter(n => n.targetUserId === session.id);
    
    if (notifications.length === 0) {
        list.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">No notifications yet</div>';
        return;
    }

    list.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="handleNotificationClick('${n.postId}')">
            <div class="notif-avatar"><i class="fas ${n.type === 'like' ? 'fa-thumbs-up' : 'fa-comment'}"></i></div>
            <div class="notif-info">
                <p><b>${n.fromUserName}</b> ${n.text}</p>
                <span>${n.date}</span>
            </div>
        </div>
    `).join('');
}

window.handleNotificationClick = (postId) => {
    // Switch to community page and scroll to post
    const communityLink = document.querySelector('.store-links a[data-page="community"]');
    if (communityLink) communityLink.click();
    
    setTimeout(() => {
        const postEl = document.getElementById(`post-${postId}`);
        if (postEl) postEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
};

function markNotificationsRead() {
    const session = Storage.getSession();
    if (!session) return;
    let notifications = Storage.getData(Storage.keys.NOTIFICATIONS);
    notifications.forEach(n => { if(n.targetUserId === session.id) n.read = true; });
    Storage.setData(Storage.keys.NOTIFICATIONS, notifications);
    setTimeout(() => {
        updateNotificationBadge();
        renderNotifications();
    }, 1000);
}

// =============================================
//  9. GLOBAL INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initAdmin();
    initStore();
    initCommunity();
    updateCart();

    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) menuToggle.addEventListener('click', () => document.querySelector('.nav-links').classList.toggle('active'));
    
    const cartToggle = document.getElementById('cart-toggle');
    if (cartToggle) cartToggle.addEventListener('click', () => document.getElementById('cart-sidebar').classList.add('open'));
    
    const closeCart = document.getElementById('close-cart');
    if (closeCart) closeCart.addEventListener('click', () => document.getElementById('cart-sidebar').classList.remove('open'));
});
