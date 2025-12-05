const API_URL = 'https://campus-taskboard.onrender.com/api';
const TOKEN_KEY = 'taskboard_token';
const USER_KEY = 'taskboard_user';

let currentUser = null;
let currentPage = 'dashboard';
let userTeams = [];
let allTeams = [];
let userTasks = [];
let taskStats = {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    handleRouteChange();
});

window.addEventListener('hashchange', handleRouteChange);

function handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const [page, tab] = hash.split('/');
    
    if (currentUser) {
        navigateTo(page);
        if (tab) {
            setTimeout(() => switchTeamTab(tab), 100);
        }
    }
}

function setupEventListeners() {
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('create-team-form')?.addEventListener('submit', handleCreateTeam);
    document.getElementById('create-task-form')?.addEventListener('submit', handleCreateTask);
    document.getElementById('edit-task-form')?.addEventListener('submit', handleEditTask);
    document.getElementById('profile-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function checkAuthStatus() {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);

    if (token && user) {
        currentUser = JSON.parse(user);
        showApp();
        loadDashboard();
    } else {
        showAuth();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('login-error', data.message || 'Login failed');
            return;
        }

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        currentUser = data.user;

        showToast('Login successful!', 'success');
        showApp();
        loadDashboard();
    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', 'Connection error. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    if (password !== passwordConfirm) {
        showError('register-error', 'Passwords do not match');
        return;
    }

    if (password.length < 6) {
        showError('register-error', 'Password must be at least 6 characters');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('register-error', data.message || 'Registration failed');
            return;
        }

        showToast('Registration successful! Please login.', 'success');
        switchPage('login');
    } catch (error) {
        console.error('Register error:', error);
        showError('register-error', 'Connection error. Please try again.');
    } finally {
        showLoading(false);
    }
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    currentUser = null;
    userTeams = [];
    userTasks = [];
    showAuth();
    showToast('Logged out successfully', 'success');
}
 ========================================
 UI NAVIGATION
 ========================================


function showAuth() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

function showApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('user-name').textContent = currentUser.name;
 Hide all auth pages (login/register) when showing app
    document.querySelectorAll('#auth-container .page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
 Always show dashboard after login
    currentPage = 'dashboard';
    navigateTo('dashboard');
}

function switchPage(pageName) {
    document.querySelectorAll('#auth-container .page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageName}-page`).classList.add('active');
}

function navigateTo(page) {
    currentPage = page;
    
    document.querySelectorAll('#app-container .page').forEach(p => {
        p.classList.remove('active');
    });

    document.getElementById(`${page}-page`).classList.add('active');
    updateActiveNavItem();

    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'teams':
            loadTeams();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

function updateActiveNavItem() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const navItems = document.querySelectorAll('.nav-item');
    const pageMap = { dashboard: 0, teams: 1, tasks: 2, profile: 3 };
    if (pageMap[currentPage] !== undefined) {
        navItems[pageMap[currentPage]]?.classList.add('active');
    }
}


async function loadDashboard() {
    try {
        showLoading(true);
        
        const summaryResponse = await fetch(`${API_URL}/dashboard/summary`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });
        const summaryData = await summaryResponse.json();

        if (summaryData.success && summaryData.summary) {
            const tasks = summaryData.summary.tasks || {};
            taskStats = {
                total: tasks.total_assigned_tasks || 0,
                pending: tasks.pending_tasks || 0,
                inProgress: tasks.in_progress_tasks || 0,
                completed: tasks.completed_tasks || 0,
                overdue: tasks.overdue_tasks || 0
            };
            updateDashboardStats();
        }

        await loadTeamsForDashboard();
        await loadAllTeamTasks();
    } catch (error) {
        console.error('Dashboard load error:', error);
        showToast('Error loading dashboard', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadAllTeamTasks() {
    try {
        const teamsResponse = await fetch(`${API_URL}/teams/my-teams`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });
        const teamsData = await teamsResponse.json();

        if (teamsData.success && teamsData.teams.length > 0) {
            let allTasks = [];
            
            for (const team of teamsData.teams) {
                const tasksResponse = await fetch(`${API_URL}/tasks/team/${team.id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
                });
                const tasksData = await tasksResponse.json();
                if (tasksData.success && tasksData.tasks) {
                    allTasks = allTasks.concat(tasksData.tasks);
                }
            }

            allTasks = allTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
            renderDashboardTasks(allTasks);
        }
    } catch (error) {
        console.error('Load team tasks error:', error);
    }
}

async function loadTeamsForDashboard() {
    try {
        const response = await fetch(`${API_URL}/teams/my-teams`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });
        const data = await response.json();

        if (data.success) {
            userTeams = data.teams;
            renderDashboardTeams();
        }
    } catch (error) {
        console.error('Teams load error:', error);
    }
}

function updateDashboardStats() {
    document.getElementById('total-tasks').textContent = taskStats.total || 0;
    document.getElementById('pending-tasks').textContent = taskStats.pending || 0;
    document.getElementById('inprogress-tasks').textContent = taskStats.inProgress || 0;
    document.getElementById('completed-tasks').textContent = taskStats.completed || 0;
    document.getElementById('overdue-tasks').textContent = taskStats.overdue || 0;
}

function renderDashboardTeams() {
    const container = document.getElementById('dashboard-teams');
    
    if (userTeams.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <p>No teams yet</p>
                <button class="btn btn-primary btn-sm" onclick="openCreateTeamModal()">Create Team</button>
            </div>
        `;
        return;
    }

    const teamsToShow = userTeams.slice(0, 3);
    container.innerHTML = teamsToShow.map(team => `
        <div class="team-card dashboard-team-card">
            <div class="team-card-header-dash">
                <h4>${escapeHtml(team.name)}</h4>
                <span class="team-badge">${escapeHtml(team.role)}</span>
            </div>
            <p class="team-desc">${escapeHtml(team.description || 'No description')}</p>
            <div class="team-card-footer">
                <span class="team-member-count">👥 ${team.member_count || 0}</span>
                <button class="btn btn-sm btn-primary" onclick="viewTeamDetails(${team.id})">View</button>
            </div>
        </div>
    `).join('');
}

function renderDashboardTasks(tasks) {
    const container = document.getElementById('dashboard-tasks');
    
    if (!tasks || tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No tasks yet</p>
                <button class="btn btn-primary btn-sm" onclick="openCreateTaskModal()">Create Task</button>
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="recent-task-item">
            <div class="task-left">
                <div class="task-status-dot ${task.status}"></div>
                <div class="task-info">
                    <h4>${escapeHtml(task.title)}</h4>
                    <p class="task-team">${escapeHtml(task.team_name || 'Team')}</p>
                </div>
            </div>
            <div class="task-right">
                <span class="task-status-badge ${getStatusClass(task.status)}">${task.status}</span>
                <span class="task-due">📅 ${formatDate(task.due_date)}</span>
            </div>
        </div>
    `).join('');
}

async function loadTeams() {
    try {
        showLoading(true);

        const myTeamsResponse = await fetch(`${API_URL}/teams/my-teams`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });
        const myTeamsData = await myTeamsResponse.json();

        if (myTeamsData.success) {
            userTeams = myTeamsData.teams;
            renderMyTeams();
            updateTeamSelectOptions();
        }

        const allTeamsResponse = await fetch(`${API_URL}/teams`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });
        const allTeamsData = await allTeamsResponse.json();

        if (allTeamsData.success) {
            allTeams = allTeamsData.teams;
            renderAvailableTeams();
        }
    } catch (error) {
        console.error('Teams load error:', error);
        showToast('Error loading teams', 'error');
    } finally {
        showLoading(false);
    }
}

function renderMyTeams() {
    const container = document.getElementById('my-teams-container');
    
    if (userTeams.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><h3>No Teams Yet</h3><p>Create or join a team to get started.</p></div>';
        return;
    }

    container.innerHTML = userTeams.map(team => `
        <div class="team-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div style="flex: 1;">
                    <h4>${escapeHtml(team.name)}</h4>
                    <p>${escapeHtml(team.description || 'No description')}</p>
                </div>
                <span class="member-role">${escapeHtml(team.role)}</span>
            </div>
            <div class="team-card-footer">
                <span class="team-member-count">👥 ${team.member_count || 0} members</span>
            </div>
            <div class="team-card-actions">
                <button class="btn btn-primary" onclick="viewTeamDetails(${team.id})">👁️ View</button>
                ${team.role === 'leader' ? `
                    <button class="btn btn-secondary" onclick="editTeam(${team.id})">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="deleteTeamConfirm(${team.id})">🗑️ Delete</button>
                ` : `
                    <button class="btn btn-danger" onclick="leaveTeamConfirm(${team.id})">👋 Leave</button>
                `}
            </div>
        </div>
    `).join('');
}

function renderAvailableTeams() {
    const container = document.getElementById('all-teams-container');
    const userTeamIds = new Set(userTeams.map(t => t.id));
    const availableTeams = allTeams.filter(t => !userTeamIds.has(t.id));

    if (availableTeams.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>You\'ve already joined all available teams!</p></div>';
        return;
    }

    container.innerHTML = availableTeams.map(team => `
        <div class="team-card">
            <h4>${escapeHtml(team.name)}</h4>
            <p>${escapeHtml(team.description || 'No description')}</p>
            <div class="team-card-footer">
                <span class="team-member-count">👥 ${team.member_count || 0} members</span>
                <button class="btn btn-primary" onclick="joinTeam(${team.id})">Join Team</button>
            </div>
        </div>
    `).join('');
}

async function handleCreateTeam(e) {
    e.preventDefault();

    const name = document.getElementById('team-name').value;
    const description = document.getElementById('team-description').value;

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/teams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify({ name, description })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Failed to create team', 'error');
            return;
        }

        showToast('Team created successfully!', 'success');
        closeModal('create-team-modal');
        document.getElementById('create-team-form').reset();
        loadTeams();
    } catch (error) {
        console.error('Create team error:', error);
        showToast('Error creating team', 'error');
    } finally {
        showLoading(false);
    }
}

async function joinTeam(teamId) {
    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/teams/${teamId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Failed to join team', 'error');
            return;
        }

        showToast('Joined team successfully!', 'success');
        loadTeams();
    } catch (error) {
        console.error('Join team error:', error);
        showToast('Error joining team', 'error');
    } finally {
        showLoading(false);
    }
}

async function editTeam(teamId) {
    try {
        const team = userTeams.find(t => t.id === teamId);
        if (!team) {
            showToast('Team not found', 'error');
            return;
        }

        document.getElementById('edit-team-id').value = team.id;
        document.getElementById('edit-team-name').value = team.name;
        document.getElementById('edit-team-description').value = team.description || '';
        
        openModal('edit-team-modal');
    } catch (error) {
        console.error('Edit team error:', error);
        showToast('Error loading team', 'error');
    }
}

async function handleEditTeam(e) {
    e.preventDefault();

    const teamId = document.getElementById('edit-team-id').value;
    const name = document.getElementById('edit-team-name').value;
    const description = document.getElementById('edit-team-description').value;

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/teams/${teamId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify({ name, description })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Failed to update team', 'error');
            return;
        }

        showToast('Team updated successfully!', 'success');
        closeModal('edit-team-modal');
        loadTeams();
    } catch (error) {
        console.error('Update team error:', error);
        showToast('Error updating team: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteTeamConfirm(teamId) {
    if (confirm('Are you sure you want to delete this team? This will also delete all tasks in the team. This action cannot be undone.')) {
        deleteTeam(teamId);
    }
}

async function deleteTeam(teamId) {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/teams/${teamId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Failed to delete team', 'error');
            return;
        }

        showToast('Team deleted successfully!', 'success');
        
        if (document.getElementById('edit-team-modal')?.classList.contains('active')) {
            closeModal('edit-team-modal');
        }
        
        loadTeams();
    } catch (error) {
        console.error('Delete team error:', error);
        showToast('Error deleting team: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function leaveTeamConfirm(teamId) {
    if (confirm('Are you sure you want to leave this team?')) {
        leaveTeam(teamId);
    }
}

async function leaveTeam(teamId) {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/teams/${teamId}/leave`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Failed to leave team', 'error');
            return;
        }

        showToast('Left team successfully!', 'success');
        loadTeams();
    } catch (error) {
        console.error('Leave team error:', error);
        showToast('Error leaving team: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function viewTeamDetails(teamId) {
    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/teams/${teamId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });

        const data = await response.json();

        if (data.success) {
            const team = data.team;
            document.getElementById('team-details-name').textContent = escapeHtml(team.name);
 Render members

            const membersList = document.getElementById('team-members-list');
            membersList.innerHTML = (team.members || []).map(member => `
                <div class="member-item">
                    <div class="member-avatar">${member.name.charAt(0).toUpperCase()}</div>
                    <div class="member-info">
                        <div class="member-name">${escapeHtml(member.name)}</div>
                        <div class="member-email">${escapeHtml(member.email)}</div>
                    </div>
                    <span class="member-role">${escapeHtml(member.role)}</span>
                </div>
            `).join('');
 Render tasks

            const tasksList = document.getElementById('team-tasks-list');
            tasksList.innerHTML = (team.tasks || []).map(task => `
                <div class="task-card" onclick="editTask(${task.id})">
                    <div class="task-card-header">
                        <h4>${escapeHtml(task.title)}</h4>
                        <span class="task-status ${getStatusClass(task.status)}">${task.status}</span>
                    </div>
                    <p class="task-description">${escapeHtml(task.description || 'No description')}</p>
                </div>
            `).join('');

            openModal('team-details-modal');
        }
    } catch (error) {
        console.error('View team error:', error);
        showToast('Error loading team details', 'error');
    } finally {
        showLoading(false);
    }
}

function updateTeamSelectOptions() {
    const select = document.getElementById('task-team');
    select.innerHTML = '<option value="">Choose a team...</option>' + 
        userTeams.map(team => `<option value="${team.id}">${escapeHtml(team.name)}</option>`).join('');
}

function switchTeamTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
}
 ========================================
 TASKS MANAGEMENT
 ========================================


async function loadTasks() {
    try {
        showLoading(true);

        const teamsResponse = await fetch(`${API_URL}/teams/my-teams`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });
        const teamsData = await teamsResponse.json();

        if (teamsData.success) {
            userTeams = teamsData.teams;
            updateTeamSelectOptions();
        }

        let allTeamTasks = [];
        
        if (userTeams && userTeams.length > 0) {
            for (const team of userTeams) {
                const teamTasksResponse = await fetch(`${API_URL}/tasks/team/${team.id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
                });
                const teamTasksData = await teamTasksResponse.json();
                if (teamTasksData.success) {
                    allTeamTasks = allTeamTasks.concat(teamTasksData.tasks || []);
                }
            }
        }

        const myTasksResponse = await fetch(`${API_URL}/tasks/my-tasks`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });
        const myTasksData = await myTasksResponse.json();

        let combinedTasks = allTeamTasks;
        if (myTasksData.success && myTasksData.tasks) {
            const taskIds = new Set(combinedTasks.map(t => t.id));
            myTasksData.tasks.forEach(task => {
                if (!taskIds.has(task.id)) {
                    combinedTasks.push(task);
                }
            });
        }

        userTasks = combinedTasks;
        renderTasks(userTasks);
    } catch (error) {
        console.error('Tasks load error:', error);
        showToast('Error loading tasks', 'error');
    } finally {
        showLoading(false);
    }
}

async function filterTasksByTeam() {
    const teamId = document.getElementById('team-filter')?.value || '';
    const status = document.getElementById('status-filter')?.value || '';

    try {
        let url = teamId ? `${API_URL}/tasks/team/${teamId}` : `${API_URL}/tasks/my-tasks`;
        const params = new URLSearchParams();
        if (status && teamId) params.append('status', status);

        const response = await fetch(`${url}${params.toString() ? '?' + params : ''}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });

        const data = await response.json();

        if (data.success) {
            userTasks = data.tasks;
            renderTasks(userTasks);
        }
    } catch (error) {
        console.error('Filter tasks error:', error);
        showToast('Error loading tasks', 'error');
    }
}

function filterTasksByStatus() {
    filterTasksByTeam();
}

function renderTasks(tasks) {
    const container = document.getElementById('tasks-container');

    if (!tasks || tasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No Tasks</h3><p>Create a new task to get started.</p></div>';
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="task-card">
            <div class="task-card-header">
                <h4>${escapeHtml(task.title)}</h4>
                <span class="task-status ${getStatusClass(task.status)}">${task.status}</span>
            </div>
            <div class="task-card-body">
                <p class="task-description">${escapeHtml(task.description || 'No description')}</p>
                <div class="task-meta">
                    <div class="task-meta-item">📅 ${formatDate(task.due_date)}</div>
                    ${task.assigned_to_name ? `<div class="task-meta-item task-assigned-to">👤 ${escapeHtml(task.assigned_to_name)}</div>` : ''}
                    ${task.created_by_name ? `<div class="task-meta-item">👨‍💼 By ${escapeHtml(task.created_by_name)}</div>` : ''}
                </div>
            </div>
            <div class="task-card-actions">
                <button class="btn btn-primary" onclick="editTask(${task.id})">✏️ Edit</button>
                <button class="btn btn-danger" onclick="deleteTaskConfirm(${task.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleCreateTask(e) {
    e.preventDefault();

    const teamId = document.getElementById('task-team').value;
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const assignedTo = document.getElementById('task-assign').value;
    const dueDate = document.getElementById('task-due-date').value;

    if (!teamId) {
        showToast('Please select a team', 'error');
        return;
    }

    try {
        showLoading(true);
        const taskData = {
            team_id: parseInt(teamId),
            title,
            description,
            assigned_to: assignedTo ? parseInt(assignedTo) : null,
            due_date: dueDate || null
        };
        
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify(taskData)
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Failed to create task', 'error');
            return;
        }

        showToast('Task created successfully!', 'success');
        closeModal('create-task-modal');
        document.getElementById('create-task-form').reset();
        
        await loadTasks();
    } catch (error) {
        console.error('Create task error:', error);
        showToast('Error creating task: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function editTask(taskId) {
    try {
        showLoading(true);
        const task = userTasks.find(t => t.id === taskId);
        
        if (!task) {
            showToast('Task not found', 'error');
            return;
        }

        document.getElementById('edit-task-id').value = task.id;
        document.getElementById('edit-task-title').value = task.title;
        document.getElementById('edit-task-description').value = task.description || '';
        document.getElementById('edit-task-status').value = task.status;
        document.getElementById('edit-task-due-date').value = task.due_date ? task.due_date.split('T')[0] : '';

        const assignSelect = document.getElementById('edit-task-assign');
        assignSelect.innerHTML = '<option value="">Unassigned</option>';

        openModal('edit-task-modal');
    } catch (error) {
        console.error('Edit task error:', error);
        showToast('Error loading task', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleEditTask(e) {
    e.preventDefault();

    const taskId = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value;
    const description = document.getElementById('edit-task-description').value;
    const status = document.getElementById('edit-task-status').value;
    const assignedTo = document.getElementById('edit-task-assign').value;
    const dueDate = document.getElementById('edit-task-due-date').value;

    try {
        showLoading(true);
        const updateData = {
            title,
            description,
            status,
            assigned_to: assignedTo ? parseInt(assignedTo) : null,
            due_date: dueDate || null
        };
        
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Failed to update task', 'error');
            return;
        }

        showToast('Task updated successfully!', 'success');
        closeModal('edit-task-modal');
        
        await loadTasks();
    } catch (error) {
        console.error('Update task error:', error);
        showToast('Error updating task: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteTaskConfirm(taskId) {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        deleteTask(taskId);
    }
}

async function deleteTask(taskId) {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Failed to delete task', 'error');
            return;
        }

        showToast('Task deleted successfully!', 'success');
        
        if (document.getElementById('edit-task-modal').classList.contains('active')) {
            closeModal('edit-task-modal');
        }
        
        await loadTasks();
    } catch (error) {
        console.error('Delete task error:', error);
        showToast('Error deleting task: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function loadProfile() {
    try {
        if (currentUser) {
            document.getElementById('profile-name').value = currentUser.name;
            document.getElementById('profile-email').value = currentUser.email;
            document.getElementById('profile-joined').value = formatDate(currentUser.created_at);
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

function openCreateTeamModal() {
    document.getElementById('create-team-form').reset();
    openModal('create-team-modal');
}

function openCreateTaskModal() {
    document.getElementById('create-task-form').reset();
    openModal('create-task-modal');
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (show) {
        spinner.classList.add('active');
    } else {
        spinner.classList.remove('active');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 'pending';
        case 'in progress':
            return 'in-progress';
        case 'completed':
            return 'completed';
        default:
            return 'pending';
    }
}
