// --- Simple Auth + CRUD for Matrimonial Biodata (client-side, localStorage) ---

/*
Storage keys:
  - users : array of { id, name, email, passwordHash }  (passwords stored as plain in this demo — DO NOT do this in production)
  - sessionUser : current logged-in email
  - biodata : array of profile objects { id, ownerEmail, name, gender, dob, contact, email, height, education, occupation, location, religion }
*/

// --- Helpers ---
const $ = id => document.getElementById(id);
const storage = {
    get(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
    remove(key) { localStorage.removeItem(key); }
};

// init sample arrays if not present
if (!storage.get('users')) storage.set('users', []);
if (!storage.get('biodata')) storage.set('biodata', []);

// --- AUTH UI elements ---
const authSection = $('auth-section');
const loginForm = $('loginForm');
const registerForm = $('registerForm');
const showRegister = $('showRegister');
const showLogin = $('showLogin');
const authError = $('auth-error');
const authTitle = $('auth-title');

const mainApp = $('main-app');
const logoutBtn = $('logoutBtn');
const userGreeting = $('user-greeting');

// --- BIO UI elements ---
const biodataForm = $('biodataForm');
const profilesList = $('profilesList');
const errorMessage = $('error-message');
const resetBtn = $('resetBtn');
const searchInput = $('searchInput');

// --- toggles ---
showRegister.addEventListener('click', e => {
    e.preventDefault();
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    authTitle.textContent = 'Register';
    authError.textContent = '';
});
showLogin.addEventListener('click', e => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    authTitle.textContent = 'Login';
    authError.textContent = '';
});

// --- Auth functions ---
function registerUser(name, email, password) {
    const users = storage.get('users') || [];
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already registered.');
    }
    const newUser = { id: Date.now(), name, email: email.toLowerCase(), password }; // simple, DO NOT use plain password in prod.
    users.push(newUser);
    storage.set('users', users);
    return newUser;
}

function loginUser(email, password) {
    const users = storage.get('users') || [];
    const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
    if (!user) throw new Error('Invalid credentials.');
    storage.set('sessionUser', user.email);
    return user;
}

function logout() {
    storage.remove('sessionUser');
    showAuth();
}

// show appropriate UI depending on session
function showAuth() {
    const session = storage.get('sessionUser');
    if (session) {
        authSection.classList.add('hidden');
        mainApp.classList.remove('hidden');
        const users = storage.get('users') || [];
        const me = users.find(u => u.email === session);
        userGreeting.textContent = me ? `Hi, ${me.name}` : `Hi`;
        renderProfiles();
    } else {
        authSection.classList.remove('hidden');
        mainApp.classList.add('hidden');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authTitle.textContent = 'Login';
    }
}

// --- Auth form handlers ---
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    authError.textContent = '';
    const email = $('loginEmail').value.trim();
    const password = $('loginPassword').value;
    try {
        loginUser(email, password);
        $('loginEmail').value = '';
        $('loginPassword').value = '';
        showAuth();
    } catch (err) {
        authError.textContent = err.message;
    }
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    authError.textContent = '';
    const name = $('regName').value.trim();
    const email = $('regEmail').value.trim();
    const password = $('regPassword').value;
    try {
        if (!name || !email || !password) throw new Error('Please fill all registration fields.');
        registerUser(name, email, password);
        // automatically login after register
        loginUser(email, password);
        $('regName').value = '';
        $('regEmail').value = '';
        $('regPassword').value = '';
        showAuth();
    } catch (err) {
        authError.textContent = err.message;
    }
});

logoutBtn.addEventListener('click', function() {
    logout();
});

// --- CRUD for biodata ---
function getBiodataArray() {
    return storage.get('biodata') || [];
}

function saveBiodataArray(arr) {
    storage.set('biodata', arr);
}

function addProfile(profile) {
    const arr = getBiodataArray();
    arr.push(profile);
    saveBiodataArray(arr);
}

function updateProfile(updated) {
    const arr = getBiodataArray();
    const idx = arr.findIndex(p => p.id === updated.id);
    if (idx === -1) throw new Error('Profile not found.');
    arr[idx] = updated;
    saveBiodataArray(arr);
}

function deleteProfile(id) {
    let arr = getBiodataArray();
    arr = arr.filter(p => p.id !== id);
    saveBiodataArray(arr);
}

// --- Validation (similar to your previous script) ---
function validateProfile(profile) {
    let errors = [];
    const contactPattern = /^[0-9]{10}$/;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    const required = ['name','gender','dob','contact','email','height','education','occupation','location','religion'];
    required.forEach(k => { if (!profile[k]) errors.push(`${k} is required.`); });

    if (profile.contact && !contactPattern.test(profile.contact)) errors.push('Contact must be a 10-digit number.');
    if (profile.email && !emailPattern.test(profile.email)) errors.push('Invalid email address.');

    return errors;
}

// --- Form submit handler (create/update) ---
biodataForm.addEventListener('submit', function(e) {
    e.preventDefault();
    errorMessage.textContent = '';

    const session = storage.get('sessionUser');
    if (!session) { errorMessage.textContent = 'You must be logged in to save.'; return; }

    const data = {
        id: $('profileId').value || String(Date.now()),
        ownerEmail: session,
        name: $('name').value.trim(),
        gender: $('gender').value,
        dob: $('dob').value,
        contact: $('contact').value.trim(),
        email: $('email').value.trim(),
        height: $('height').value.trim(),
        education: $('education').value.trim(),
        occupation: $('occupation').value.trim(),
        location: $('location').value.trim(),
        religion: $('religion').value
    };

    const errors = validateProfile(data);
    if (errors.length) {
        errorMessage.innerHTML = errors.join('<br>');
        return;
    }

    try {
        if ($('profileId').value) {
            updateProfile(data);
            showToast('Profile updated.');
        } else {
            addProfile(data);
            showToast('Profile added.');
        }
        biodataForm.reset();
        $('profileId').value = '';
        renderProfiles();
    } catch (err) {
        errorMessage.textContent = err.message;
    }
});

// Reset button handler
resetBtn.addEventListener('click', function() {
    biodataForm.reset();
    $('profileId').value = '';
    errorMessage.textContent = '';
});

// --- Rendering profiles list ---
function renderProfiles() {
    const session = storage.get('sessionUser');
    const all = getBiodataArray();
    // Show all profiles (optionally, filter to owner only). We'll show all so users can browse; only owner can edit/delete their own.
    const q = searchInput.value.trim().toLowerCase();
    const filtered = all.filter(p => {
        if (!q) return true;
        return (p.name + ' ' + p.location + ' ' + p.education).toLowerCase().includes(q);
    });

    profilesList.innerHTML = '';

    if (!filtered.length) {
        profilesList.innerHTML = '<div class="muted">No profiles saved yet.</div>';
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'profile-card';

        const left = document.createElement('div');
        left.className = 'profile-meta';
        left.innerHTML = `<strong>${escapeHtml(p.name)}</strong><div class="muted">${p.occupation} • ${p.location}</div><div class="muted">Email: ${escapeHtml(p.email)}</div>`;

        const right = document.createElement('div');
        right.className = 'profile-actions';

        // View button (fills form for quick view/edit if owner)
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', () => {
            populateForm(p);
        });
        right.appendChild(viewBtn);

        // If logged-in user is owner, allow edit/delete
        if (session && session === p.ownerEmail) {
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => populateForm(p));
            right.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.className = 'secondary';
            delBtn.addEventListener('click', () => {
                if (confirm('Delete this profile?')) {
                    deleteProfile(p.id);
                    renderProfiles();
                    showToast('Profile deleted.');
                }
            });
            right.appendChild(delBtn);
        } else {
            // show owner name for non-owners
            const ownerInfo = document.createElement('div');
            ownerInfo.className = 'muted small';
            const users = storage.get('users') || [];
            const owner = users.find(u => u.email === p.ownerEmail);
            ownerInfo.textContent = `Posted by: ${owner ? owner.name : p.ownerEmail}`;
            right.appendChild(ownerInfo);
        }

        card.appendChild(left);
        card.appendChild(right);
        profilesList.appendChild(card);
    });
}

// populate the form for editing / viewing
function populateForm(p) {
    $('profileId').value = p.id;
    $('name').value = p.name || '';
    $('gender').value = p.gender || '';
    $('dob').value = p.dob || '';
    $('contact').value = p.contact || '';
    $('email').value = p.email || '';
    $('height').value = p.height || '';
    $('education').value = p.education || '';
    $('occupation').value = p.occupation || '';
    $('location').value = p.location || '';
    $('religion').value = p.religion || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// search handler
searchInput.addEventListener('input', () => renderProfiles());

// small toast helper
function showToast(msg) {
    // simple alert-like ephemeral message
    const prev = document.querySelector('.__toast');
    if (prev) prev.remove();
    const div = document.createElement('div');
    div.className = '__toast';
    div.textContent = msg;
    Object.assign(div.style, {
        position: 'fixed', right: '20px', bottom: '20px', background: '#333', color: '#fff', padding: '10px 14px',
        borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    });
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2600);
}

// XSS escape for small use
function escapeHtml(s) { return (s+'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// --- initial view ---
showAuth();
renderProfiles();
