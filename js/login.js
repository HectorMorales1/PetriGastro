const AUTH_KEY = 'petriAuth';
const REGISTERED_USERS_KEY = 'petriRegisteredUsers';

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
        const loadedUsers = await loadUsers();
        const registeredUsers = getRegisteredUsers();
        usersData = { ...loadedUsers, ...registeredUsers };
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

function getAllUsers() {
    const registeredUsers = getRegisteredUsers();
    return { ...usersData, ...registeredUsers };
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
        userError.textContent = 'Usuario requerido';
        userError.classList.add('show');
        usernameInput.classList.add('error');
        hasError = true;
    }
    
    if (!password) {
        passError.textContent = 'Contraseña requerida';
        passError.classList.add('show');
        passwordInput.classList.add('error');
        hasError = true;
    }
    
    if (hasError) return;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div>';
    
    setTimeout(() => {
        const allUsers = getAllUsers();
        const user = allUsers[username];
        
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

const registerModal = document.getElementById('registerModal');
const openRegisterLink = document.getElementById('openRegister');
const closeRegisterBtn = document.getElementById('closeRegister');
const registerForm = document.getElementById('registerForm');
const registerBtn = document.getElementById('registerBtn');
const registerSuccess = document.getElementById('registerSuccess');
const emailError = document.getElementById('emailError');
const regPassError = document.getElementById('regPassError');
const regNameInput = document.getElementById('regName');
const regLastNameInput = document.getElementById('regLastName');
const regEmailInput = document.getElementById('regEmail');
const regPasswordInput = document.getElementById('regPassword');

function openModal() {
    registerModal.classList.add('active');
    registerForm.style.display = 'block';
    registerSuccess.classList.remove('show');
    registerForm.reset();
    clearRegisterErrors();
}

function closeModal() {
    registerModal.classList.remove('active');
}

function clearRegisterErrors() {
    emailError.classList.remove('show');
    regPassError.classList.remove('show');
    regEmailInput.classList.remove('error');
    regPasswordInput.classList.remove('error');
}

function getRegisteredUsers() {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY);
    return stored ? JSON.parse(stored) : {};
}

function saveRegisteredUser(username, userData) {
    const users = getRegisteredUsers();
    users[username] = userData;
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function usernameExists(username) {
    return usersData.hasOwnProperty(username) || getRegisteredUsers().hasOwnProperty(username);
}

function emailExists(email) {
    const users = getRegisteredUsers();
    return Object.values(users).some(u => u.email === email);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function generateUsername(name, lastName, email) {
    let baseUsername = email.split('@')[0];
    baseUsername = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;
    
    while (usernameExists(username)) {
        username = baseUsername + counter;
        counter++;
    }
    return username;
}

openRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    openModal();
});

closeRegisterBtn.addEventListener('click', closeModal);

registerModal.addEventListener('click', function(e) {
    if (e.target === registerModal) {
        closeModal();
    }
});

regEmailInput.addEventListener('input', function() {
    emailError.classList.remove('show');
    regEmailInput.classList.remove('error');
});

regPasswordInput.addEventListener('input', function() {
    regPassError.classList.remove('show');
    regPasswordInput.classList.remove('error');
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    clearRegisterErrors();
    
    const name = regNameInput.value.trim();
    const lastName = regLastNameInput.value.trim();
    const email = regEmailInput.value.trim().toLowerCase();
    const password = regPasswordInput.value;
    
    let hasError = false;
    
    if (!name) {
        regNameInput.classList.add('error');
        hasError = true;
    }
    
    if (!lastName) {
        regLastNameInput.classList.add('error');
        hasError = true;
    }
    
    if (!email || !validateEmail(email)) {
        emailError.textContent = 'Ingresa un correo electrónico válido';
        emailError.classList.add('show');
        regEmailInput.classList.add('error');
        hasError = true;
    } else if (emailExists(email)) {
        emailError.textContent = 'Este correo ya está registrado';
        emailError.classList.add('show');
        regEmailInput.classList.add('error');
        hasError = true;
    }
    
    if (!password || password.length < 6) {
        regPassError.textContent = 'La contraseña debe tener al menos 6 caracteres';
        regPassError.classList.add('show');
        regPasswordInput.classList.add('error');
        hasError = true;
    }
    
    if (hasError) return;
    
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<div class="spinner"></div>';
    
    setTimeout(() => {
        const username = generateUsername(name, lastName, email);
        const fullName = `${name} ${lastName}`;
        
        const userData = {
            password: password,
            role: 'user',
            name: fullName,
            email: email,
            createdAt: new Date().toISOString()
        };
        
        saveRegisteredUser(username, userData);
        
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<span>Crear cuenta</span>';
        registerForm.style.display = 'none';
        registerSuccess.classList.add('show');
        
        setTimeout(() => {
            closeModal();
        }, 2000);
    }, 500);
});

init();