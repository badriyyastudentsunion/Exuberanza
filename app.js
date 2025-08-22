// Main application logic - Updated login functions for new schema
document.addEventListener('DOMContentLoaded', function() {
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const roleSelect = document.getElementById('roleSelect');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id) {
        showDashboard(currentUser);
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Handle Enter key in form fields
    [username, password].forEach(field => {
        if (field) {
            field.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
    });

    async function handleLogin() {
        const role = roleSelect.value;
        const usernameVal = username.value.trim();
        const passwordVal = password.value.trim();

        if (!role || !usernameVal || !passwordVal) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        try {
            let user = null;
            
            switch (role) {
                case 'admin':
                    user = await loginAdmin(usernameVal, passwordVal);
                    break;
                case 'team_leader':
                    user = await loginTeamLeader(usernameVal, passwordVal);
                    break;
                case 'invigilator':
                    user = await loginInvigilator(usernameVal, passwordVal);
                    break;
                case 'judge':
                    user = await loginJudge(usernameVal, passwordVal);
                    break;
                case 'announcer':
                    // Announcer uses admin credentials for now
                    user = await loginAdmin(usernameVal, passwordVal);
                    if (user) user.role = 'announcer';
                    break;
            }

            if (user) {
                setCurrentUser(user);
                showDashboard(user);
                showNotification('Login successful');
                // Clear form
                username.value = '';
                password.value = '';
                roleSelect.value = '';
            } else {
                showNotification('Invalid credentials', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Login failed: ' + error.message, 'error');
        } finally {
            // Reset loading state
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    }

    async function loginAdmin(username, password) {
        try {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();
            
            if (error) throw error;
            return { ...data, role: 'admin' };
        } catch (error) {
            console.error('Admin login error:', error);
            return null;
        }
    }

    async function loginTeamLeader(teamName, password) {
        try {
            const { data, error } = await supabase
                .from('teams')
                .select('*')
                .eq('name', teamName)
                .eq('password', password)
                .eq('leader_access', true)
                .single();
            
            if (error) throw error;
            return { ...data, role: 'team_leader' };
        } catch (error) {
            console.error('Team leader login error:', error);
            return null;
        }
    }

    async function loginInvigilator(name, password) {
        try {
            const { data, error } = await supabase
                .from('invigilators')
                .select('*')
                .eq('name', name)
                .eq('password', password)
                .single();
            
            if (error) throw error;
            return { ...data, role: 'invigilator' };
        } catch (error) {
            console.error('Invigilator login error:', error);
            return null;
        }
    }

    async function loginJudge(name, password) {
        try {
            const { data, error } = await supabase
                .from('judges')
                .select('*')
                .eq('name', name)
                .eq('password', password)
                .single();
            
            if (error) throw error;
            return { ...data, role: 'judge' };
        } catch (error) {
            console.error('Judge login error:', error);
            return null;
        }
    }

    function showDashboard(user) {
        if (loginScreen) loginScreen.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
        
        const dashboardTitle = document.getElementById('dashboardTitle');
        const userInfo = document.getElementById('userInfo');
        
        if (dashboardTitle) {
            dashboardTitle.textContent = `${user.role.replace('_', ' ').toUpperCase()} Dashboard`;
        }
        
        if (userInfo) {
            userInfo.textContent = `Welcome, ${user.name || user.username}`;
        }
        
        // Load role-specific content
        loadRoleContent(user);
    }

    function loadRoleContent(user) {
        const content = document.getElementById('content');
        if (!content) return;
        
        try {
            switch (user.role) {
                case 'admin':
                    if (typeof loadAdminContent === 'function') {
                        loadAdminContent(content);
                    } else {
                        content.innerHTML = '<div class="bg-red-50 p-4 rounded">Admin module not loaded</div>';
                    }
                    break;
                case 'team_leader':
                    loadTeamLeaderContent(content, user);
                    break;
                case 'invigilator':
                    loadInvigilatorContent(content, user);
                    break;
                case 'judge':
                    loadJudgeContent(content, user);
                    break;
                case 'announcer':
                    loadAnnouncerContent(content, user);
                    break;
                default:
                    content.innerHTML = '<div class="bg-red-50 p-4 rounded">Unknown role</div>';
            }
        } catch (error) {
            console.error('Error loading role content:', error);
            content.innerHTML = '<div class="bg-red-50 p-4 rounded">Error loading content</div>';
        }
    }
});
