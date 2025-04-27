document.addEventListener('DOMContentLoaded', function() {
    const userList = document.getElementById('userList');
    const newUserCard = document.getElementById('newUserCard');
    const createUserBtn = document.getElementById('createUserBtn');
    const newUsernameInput = document.getElementById('newUsername');

    // Load existing users
    loadUsers();

    // Create new user
    createUserBtn.addEventListener('click', createNewUser);

    function loadUsers() {
        const users = JSON.parse(localStorage.getItem('portfolioUsers')) || {};
        
        userList.innerHTML = '';
        
        for (const username in users) {
            const userCard = document.createElement('div');
            userCard.className = 'card user-card';
            userCard.innerHTML = `
                <div class="card-body text-center">
                    <h5>${username}</h5>
                    <p class="text-muted small">Created: ${new Date(users[username].createdAt).toLocaleDateString()}</p>
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
        
        if (!username) {
            alert('Please enter a profile name');
            return;
        }

        const users = JSON.parse(localStorage.getItem('portfolioUsers')) || {};
        
        if (users[username]) {
            alert('Profile name already exists');
            return;
        }

        users[username] = {
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        localStorage.setItem('portfolioUsers', JSON.stringify(users));
        
        // Also initialize portfolios storage if it doesn't exist
        const portfolios = JSON.parse(localStorage.getItem('portfolioPortfolios')) || {};
        if (!portfolios[username]) {
            portfolios[username] = {};
            localStorage.setItem('portfolioPortfolios', JSON.stringify(portfolios));
        }

        newUsernameInput.value = '';
        loadUsers();
        selectUser(username);
    }

    function selectUser(username) {
        sessionStorage.setItem('currentUser', username);
        window.location.href = 'index.html'; // Redirect to main app
    }
});