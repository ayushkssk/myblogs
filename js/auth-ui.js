// UI Elements
const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const alert = document.getElementById('alert');
const alertMessage = document.getElementById('alertMessage');

// Show/Hide functions
window.showLogin = function() {
    loginCard.classList.remove('hidden');
    signupCard.classList.add('hidden');
}

window.showSignup = function() {
    loginCard.classList.add('hidden');
    signupCard.classList.remove('hidden');
}

// Show alert message
function showAlert(message, type = 'error') {
    alert.classList.remove('hidden', 'alert-success', 'alert-error');
    alert.classList.add(`alert-${type}`);
    alertMessage.textContent = message;
    setTimeout(() => {
        alert.classList.add('hidden');
    }, 5000);
}

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const result = await window.loginUser(email, password);
    
    if (result.success) {
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showAlert(result.error);
    }
});

// Handle Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const phone = document.getElementById('signupPhone').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const result = await window.signupUser(email, password, name, phone);
    
    if (result.success) {
        showAlert('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showAlert(result.error);
    }
});
