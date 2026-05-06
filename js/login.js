const AUTH_KEY = 'petriAuth';

const DEFAULT_USERS = {
    'admin': { password: 'admin123', role: 'admin', name: 'Administrador' },
    'chef': { password: 'chef123', role: 'chef', name: 'Chef Petri' },
    'user': { password: 'user123', role: 'user', name: 'Usuario' }
};

const USERS_URL = 'data/users.json';
let usersData = DEFAULT_USERS;

function generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const userError = document.getElementById('userError');
const passError = document.getElementById('passError');

async function loadUsers() {
    try {
        const response = await fetch(USERS_URL);
        if (!response.ok) throw new Error('Failed to load users');
        const data = await response.json();
        return data.users;
    } catch (error) {
        return DEFAULT_USERS;
    }
}

async function init() {
    if (window.location.protocol === 'file:') {
        console.log('Running from file - using default users');
    } else {
        usersData = await loadUsers();
    }

    const storedAuth = localStorage.getItem(AUTH_KEY);
    if (storedAuth) {
        try {
            const auth = JSON.parse(storedAuth);
            if (auth.sessionId && auth.user && auth.expires > Date.now()) {
                window.location.href = 'index.html';
            }
        } catch (e) {
            localStorage.removeItem(AUTH_KEY);
        }
    }
}

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    
    userError.classList.remove('show');
    passError.classList.remove('show');
    usernameInput.classList.remove('error');
    passwordInput.classList.remove('error');
    
    let hasError = false;
    
    if (!username) {
        userError.classList.add('show');
        usernameInput.classList.add('error');
        hasError = true;
    }
    
    if (!password) {
        passError.classList.add('show');
        passwordInput.classList.add('error');
        hasError = true;
    }
    
    if (hasError) return;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div>';
    
    setTimeout(() => {
        const user = usersData[username];
        
        if (!user || user.password !== password) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Acceder</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
            
            userError.textContent = 'Usuario o contraseña incorrectos';
            userError.classList.add('show');
            usernameInput.classList.add('error');
            passwordInput.classList.add('error');
            return;
        }
        
        const sessionId = generateSecureToken();
        const auth = {
            sessionId: sessionId,
            user: username,
            role: user.role,
            name: user.name,
            expires: Date.now() + (24 * 60 * 60 * 1000)
        };
        
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
        
        submitBtn.innerHTML = '<span>Accediendo...</span>';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }, 500);
});

usernameInput.addEventListener('input', function() {
    userError.classList.remove('show');
    usernameInput.classList.remove('error');
});

passwordInput.addEventListener('input', function() {
    passError.classList.remove('show');
    passwordInput.classList.remove('error');
});

init();