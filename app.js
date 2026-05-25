/**
 * Academy App Logic
 * Handles state, routing, and UI interactions
 */

// --- State Management ---
const state = {
    user: null,
    view: 'auth', // 'auth', 'home', 'profile'
    posts: [
        { id: 1, user: 'Sophea', content: 'Welcome to Academy! 🎓 I just uploaded the new curriculum for the "Modern Web Design" course. Check it out in the Explore tab!', time: '2h ago' },
        { id: 2, user: 'Dara', content: 'Does anyone have tips for mastering CSS Glassmorphism? I am struggling with the contrast on mobile devices. 📱', time: '5h ago' }
    ]
};

// --- DOM Elements ---
const elements = {
    authScreen: document.getElementById('auth-screen'),
    mainLayout: document.getElementById('main-layout'),
    loginForm: document.getElementById('login-form'),
    usernameDisplay: document.getElementById('username-display'),
    viewTitle: document.getElementById('view-title'),
    feedView: document.getElementById('feed-view'),
    profileView: document.getElementById('profile-view'),
    feedContainer: document.getElementById('feed-container'),
    userPostsContainer: document.getElementById('user-posts-container'),
    createPostModal: document.getElementById('create-post-modal'),
    postInput: document.getElementById('post-input'),
    // Nav Items
    navHome: document.getElementById('nav-home'),
    navProfile: document.getElementById('nav-profile'),
    btnCreatePost: document.getElementById('btn-create-post'),
    btnCancelPost: document.getElementById('btn-cancel-post'),
    btnSubmitPost: document.getElementById('btn-submit-post'),
    userPillBtn: document.getElementById('user-pill-btn'),
};

// --- Initialization ---
function init() {
    console.log('Academy Initialized');
    setupEventListeners();
    render();
}

// --- Event Listeners ---
function setupEventListeners() {
    // Auth
    elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    // Navigation
    elements.navHome.addEventListener('click', () => switchView('home'));
    elements.navProfile.addEventListener('click', () => switchView('profile'));
    elements.userPillBtn.addEventListener('click', () => switchView('profile'));

    // Post Modal
    elements.btnCreatePost.addEventListener('click', () => showModal(true));
    elements.btnCancelPost.addEventListener('click', () => showModal(false));
    elements.btnSubmitPost.addEventListener('click', handleCreatePost);
}

// --- Actions ---
async function handleLogin() {
    const email = document.getElementById('email').value;
    state.user = { 
        email, 
        username: email.split('@')[0],
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
    };
    state.view = 'home';
    render();
}

function switchView(viewName) {
    state.view = viewName;
    render();
}

function showModal(show) {
    elements.createPostModal.style.display = show ? 'flex' : 'none';
    if (show) elements.postInput.focus();
}

function handleCreatePost() {
    const content = elements.postInput.value.trim();
    if (!content) return;

    const newPost = {
        id: Date.now(),
        user: state.user.name,
        content: content,
        time: 'Just now'
    };

    state.posts.unshift(newPost);
    elements.postInput.value = '';
    showModal(false);
    render();
}

// --- Rendering ---
function render() {
    if (state.view === 'auth') {
        elements.authScreen.style.display = 'flex';
        elements.mainLayout.style.display = 'none';
    } else {
        elements.authScreen.style.display = 'none';
        elements.mainLayout.style.display = 'grid';
        
        // Update User Info
        if (state.user) {
            elements.usernameDisplay.textContent = state.user.username;
            document.getElementById('profile-name').textContent = state.user.name;
            document.getElementById('profile-email').textContent = state.user.email;
        }

        // Toggle Views
        if (state.view === 'home') {
            elements.viewTitle.textContent = 'Home Feed';
            elements.feedView.style.display = 'block';
            elements.profileView.style.display = 'none';
            elements.navHome.classList.add('active');
            elements.navProfile.classList.remove('active');
            renderPosts(elements.feedContainer, state.posts);
        } else if (state.view === 'profile') {
            elements.viewTitle.textContent = 'My Profile';
            elements.feedView.style.display = 'none';
            elements.profileView.style.display = 'block';
            elements.navHome.classList.remove('active');
            elements.navProfile.classList.add('active');
            
            // Filter posts for current user
            const userPosts = state.posts.filter(p => p.user === state.user.name);
            renderPosts(elements.userPostsContainer, userPosts);
        }
    }
}

function renderPosts(container, posts) {
    if (posts.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align: center; padding: 40px;">No posts yet.</p>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="post-card glass animate-fade-in">
            <div class="post-header">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user}" alt="avatar" class="avatar-sm">
                <div>
                    <div class="post-user">${post.user}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <span class="action-item">❤️ Like</span>
                <span class="action-item">💬 Comment</span>
                <span class="action-item">🔗 Share</span>
            </div>
        </div>
    `).join('');
}

// Start the app
init();
