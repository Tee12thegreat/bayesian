document.addEventListener('DOMContentLoaded', function() {
    const userList = document.getElementById('userList');
    const createUserBtn = document.getElementById('createUserBtn');
    const loginBtn = document.getElementById('loginBtn');
    const newUsernameInput = document.getElementById('newUsername');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const loginUsernameInput = document.getElementById('loginUsername');
    const loginPasswordInput = document.getElementById('loginPassword');

    // Load existing users
    loadUsers();

    // Create new user
    createUserBtn.addEventListener('click', createNewUser);
    
    // Login user
    loginBtn.addEventListener('click', loginUser);

    function loadUsers() {
        const users = JSON.parse(localStorage.getItem('portfolioUsers')) || {};
        
        userList.innerHTML = '';
        
        if (Object.keys(users).length === 0) {
            userList.innerHTML = '<p class="text-muted text-center">No profiles found. Create one to get started.</p>';
            return;
        }
        
        for (const username in users) {
            const userCard = document.createElement('div');
            userCard.className = 'card user-card';
            userCard.innerHTML = `
                <div class="card-body">
                    <h5>${username}</h5>
                    <p class="text-muted small">Created: ${new Date(users[username].createdAt).toLocaleDateString()}</p>
                    <p class="text-muted small">Last login: ${users[username].lastLogin ? new Date(users[username].lastLogin).toLocaleDateString() : 'Never'}</p>
                    <button class="btn btn-primary select-user" data-username="${username}">Select</button>
                </div>
            `;
            userList.appendChild(userCard);
        }

        // Add event listeners to select buttons
        document.querySelectorAll('.select-user').forEach(btn => {
            btn.addEventListener('click', function() {
                selectUser(this.dataset.username);
            });
        });
    }

    function createNewUser() {
        const username = newUsernameInput.value.trim();
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!username) {
            alert('Please enter a username');
            return;
        }
        
        if (!password) {
            alert('Please enter a password');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        const users = JSON.parse(localStorage.getItem('portfolioUsers')) || {};
        
        if (users[username]) {
            alert('Username already exists');
            return;
        }

        // Simple password hashing (in a real app, use a proper hashing library)
        const passwordHash = btoa(encodeURIComponent(password));
        
        users[username] = {
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            passwordHash: passwordHash
        };

        localStorage.setItem('portfolioUsers', JSON.stringify(users));
        
        // Initialize portfolios storage
        const portfolios = JSON.parse(localStorage.getItem('portfolioPortfolios')) || {};
        if (!portfolios[username]) {
            portfolios[username] = {};
            localStorage.setItem('portfolioPortfolios', JSON.stringify(portfolios));
        }

        // Clear form
        newUsernameInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        
        // Switch to select profile tab
        const tab = new bootstrap.Tab(document.querySelector('#authTabs a[href="#selectProfile"]'));
        tab.show();
        
        loadUsers();
        selectUser(username);
    }

    function loginUser() {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value;
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        const users = JSON.parse(localStorage.getItem('portfolioUsers')) || {};
        
        if (!users[username]) {
            alert('Username not found');
            return;
        }
        
        // Verify password
        const passwordHash = btoa(encodeURIComponent(password));
        if (users[username].passwordHash !== passwordHash) {
            alert('Incorrect password');
            return;
        }
        
        // Update last login
        users[username].lastLogin = new Date().toISOString();
        localStorage.setItem('portfolioUsers', JSON.stringify(users));
        
        // Clear form
        loginUsernameInput.value = '';
        loginPasswordInput.value = '';
        
        selectUser(username);
    }

    function selectUser(username) {
        sessionStorage.setItem('currentUser', username);
        window.location.href = 'index.html'; // Redirect to main app
    }
});