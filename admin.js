// Admin main functionality - Dashboard, Results, Schedule, Settings, and Navigation
function loadAdminContent(content) {
    content.innerHTML = `
        <div class="flex min-h-screen bg-gray-100">
            <!-- Sidebar -->
            <div class="w-64 bg-white shadow-lg">
                <div class="p-6 border-b">
                    <h2 class="text-xl font-semibold text-gray-800">Admin Panel</h2>
                </div>
                <nav class="mt-6">
                    <div class="space-y-2 px-4">
                        <button onclick="showAdminDashboard()" class="admin-nav-btn active" id="nav-dashboard">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            Dashboard
                        </button>
                        <button onclick="showTeamsManagement()" class="admin-nav-btn" id="nav-teams">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            Teams
                        </button>
                        <button onclick="showCategoriesManagement()" class="admin-nav-btn" id="nav-categories">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                            Categories
                        </button>
                        <button onclick="showParticipantsManagement()" class="admin-nav-btn" id="nav-participants">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            Participants
                        </button>
                        <button onclick="showCompetitionsManagement()" class="admin-nav-btn" id="nav-competitions">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                            Competitions
                        </button>
                        <button onclick="showInvigilatorsManagement()" class="admin-nav-btn" id="nav-invigilators">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            Invigilators
                        </button>
                        <button onclick="showJudgesManagement()" class="admin-nav-btn" id="nav-judges">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Judges
                        </button>
                        <button onclick="showAdminResults()" class="admin-nav-btn" id="nav-results">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            Results
                        </button>
                        <button onclick="showAdminSchedule()" class="admin-nav-btn" id="nav-schedule">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Schedule
                        </button>
                        <button onclick="showAdminSettings()" class="admin-nav-btn" id="nav-settings">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            Settings
                        </button>
                    </div>
                </nav>
            </div>

            <!-- Main Content -->
            <div class="flex-1 p-6">
                <div id="adminMainContent">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        </div>
    `;

    // Add CSS for navigation
    const style = document.createElement('style');
    style.textContent = `
        .admin-nav-btn {
            width: 100%;
            text-align: left;
            padding: 12px 16px;
            margin: 2px 0;
            color: #6B7280;
            background: none;
            border: none;
            border-radius: 6px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            font-size: 14px;
        }
        .admin-nav-btn:hover {
            background-color: #F3F4F6;
            color: #1F2937;
        }
        .admin-nav-btn.active {
            background-color: #3B82F6;
            color: white;
        }
        .status-card {
            cursor: pointer;
            transition: transform 0.2s;
        }
        .status-card:hover {
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
    
    showAdminDashboard(); // Show dashboard by default
}

function setActiveNav(navId) {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
    const navElement = document.getElementById(navId);
    if (navElement) {
        navElement.classList.add('active');
    }
}

async function showAdminDashboard() {
    setActiveNav('nav-dashboard');
    const content = document.getElementById('adminMainContent');
    
    try {
        // Fetch dashboard statistics
        const [competitions, results, teams, participants] = await Promise.all([
            supabase.from('competitions').select('*'),
            supabase.from('results').select('*, competitions(*)').order('created_at', { ascending: false }),
            supabase.from('teams').select('*'),
            supabase.from('participants').select('*')
        ]);
        
        const totalCompetitions = competitions.data?.length || 0;
        
        // Competition status calculations
        const competitionsWithResults = new Set();
        const completedCompetitions = new Set();
        const nonProceededResults = [];
        const proceededResults = [];
        const publishedResults = [];
        
        results.data?.forEach(result => {
            competitionsWithResults.add(result.competition_id);
            if (result.points && result.points > 0) {
                completedCompetitions.add(result.competition_id);
            }
            if (result.status === 'pending') {
                nonProceededResults.push(result);
            } else if (result.status === 'announced') {
                proceededResults.push(result);
            } else if (result.status === 'published') {
                publishedResults.push(result);
            }
        });
        
        const nonCompletedCount = totalCompetitions - completedCompetitions.size;
        const completedCount = completedCompetitions.size;
        const nonProceededCount = nonProceededResults.length;
        const proceededCount = proceededResults.length;
        const publishedCount = publishedResults.length;
        
        content.innerHTML = `
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p class="text-gray-600">Overview of arts festival management</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                <div class="status-card bg-white p-6 rounded-lg shadow-sm" onclick="showCompetitionsByStatus('total')">
                    <div class="flex items-center">
                        <div class="bg-blue-100 p-3 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-800">${totalCompetitions}</p>
                            <p class="text-gray-600 text-sm">Total</p>
                        </div>
                    </div>
                </div>
                
                <div class="status-card bg-white p-6 rounded-lg shadow-sm" onclick="showCompetitionsByStatus('non_completed')">
                    <div class="flex items-center">
                        <div class="bg-red-100 p-3 rounded-lg">
                            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-800">${nonCompletedCount}</p>
                            <p class="text-gray-600 text-sm">Non Completed</p>
                        </div>
                    </div>
                </div>
                
                <div class="status-card bg-white p-6 rounded-lg shadow-sm" onclick="showCompetitionsByStatus('completed')">
                    <div class="flex items-center">
                        <div class="bg-green-100 p-3 rounded-lg">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-800">${completedCount}</p>
                            <p class="text-gray-600 text-sm">Completed</p>
                        </div>
                    </div>
                </div>
                
                <div class="status-card bg-white p-6 rounded-lg shadow-sm" onclick="showCompetitionsByStatus('non_proceeded')">
                    <div class="flex items-center">
                        <div class="bg-yellow-100 p-3 rounded-lg">
                            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-800">${nonProceededCount}</p>
                            <p class="text-gray-600 text-sm">Non Proceeded</p>
                        </div>
                    </div>
                </div>
                
                <div class="status-card bg-white p-6 rounded-lg shadow-sm" onclick="showCompetitionsByStatus('proceeded')">
                    <div class="flex items-center">
                        <div class="bg-purple-100 p-3 rounded-lg">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-800">${proceededCount}</p>
                            <p class="text-gray-600 text-sm">Proceeded</p>
                        </div>
                    </div>
                </div>
                
                <div class="status-card bg-white p-6 rounded-lg shadow-sm" onclick="showCompetitionsByStatus('published')">
                    <div class="flex items-center">
                        <div class="bg-indigo-100 p-3 rounded-lg">
                            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-800">${publishedCount}</p>
                            <p class="text-gray-600 text-sm">Published</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboardDetails">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">Team Points Status</h3>
                    <div class="space-y-2 max-h-80 overflow-y-auto">
                        ${teams.data?.sort((a, b) => b.total_points - a.total_points).map((team, index) => `
                            <div class="flex justify-between items-center p-2 rounded ${index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-50' : index === 2 ? 'bg-orange-50' : ''}">
                                <span class="font-medium">${index + 1}. ${team.name}</span>
                                <span class="font-bold text-blue-600">${team.total_points} pts</span>
                            </div>
                        `).join('') || '<p class="text-gray-500">No teams found</p>'}
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">System Statistics</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Total Teams:</span>
                            <span class="font-semibold">${teams.data?.length || 0}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Total Participants:</span>
                            <span class="font-semibold">${participants.data?.length || 0}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Teams with Leader Access:</span>
                            <span class="font-semibold">${teams.data?.filter(t => t.leader_access).length || 0}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">System Status:</span>
                            <span class="font-semibold text-green-600">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Dashboard loading error:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-800 font-medium">Error loading dashboard</div>
                <div class="text-red-600 text-sm mt-1">${error.message}</div>
            </div>
        `;
    }
}

async function showCompetitionsByStatus(status) {
    const content = document.getElementById('dashboardDetails');
    
    try {
        let competitions = [];
        let results = [];
        let title = '';
        
        const [allCompetitions, allResults] = await Promise.all([
            supabase.from('competitions').select('*, categories(name)'),
            supabase.from('results').select('*, competitions(name, categories(name))')
        ]);
        
        const competitionsWithPoints = new Set();
        allResults.data?.forEach(result => {
            if (result.points && result.points > 0) {
                competitionsWithPoints.add(result.competition_id);
            }
        });
        
        switch (status) {
            case 'total':
                competitions = allCompetitions.data || [];
                title = 'All Competitions';
                break;
            case 'non_completed':
                competitions = (allCompetitions.data || []).filter(comp => !competitionsWithPoints.has(comp.id));
                title = 'Non Completed Competitions';
                break;
            case 'completed':
                competitions = (allCompetitions.data || []).filter(comp => competitionsWithPoints.has(comp.id));
                title = 'Completed Competitions';
                break;
            case 'non_proceeded':
                results = (allResults.data || []).filter(result => result.status === 'pending');
                title = 'Non Proceeded Results';
                break;
            case 'proceeded':
                results = (allResults.data || []).filter(result => result.status === 'announced');
                title = 'Proceeded Results';
                break;
            case 'published':
                results = (allResults.data || []).filter(result => result.status === 'published');
                title = 'Published Results';
                break;
        }
        
        content.innerHTML = `
            <div class="col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">${title} (${(competitions.length || results.length)})</h3>
                    <button onclick="showAdminDashboard()" class="text-blue-600 hover:text-blue-800">← Back to Dashboard</button>
                </div>
                <div class="overflow-x-auto">
                    ${competitions.length > 0 ? `
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${competitions.map(comp => `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${comp.name}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${comp.categories?.name || 'N/A'}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 text-xs rounded ${getStatusColor(comp.status)}">
                                                ${comp.status}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${comp.scheduled_at ? new Date(comp.scheduled_at).toLocaleDateString() : 'Not scheduled'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${results.map(result => `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${result.competitions?.name || 'N/A'}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${result.competitions?.categories?.name || 'N/A'}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 text-xs rounded ${getResultStatusColor(result.status)}">
                                                ${result.status}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(result.created_at).toLocaleDateString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Competition status loading error:', error);
        content.innerHTML = `
            <div class="col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-800 font-medium">Error loading competition data</div>
                <div class="text-red-600 text-sm mt-1">${error.message}</div>
            </div>
        `;
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'ongoing': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getResultStatusColor(status) {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'announced': return 'bg-blue-100 text-blue-800';
        case 'published': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

async function showAdminResults() {
    setActiveNav('nav-results');
    const content = document.getElementById('adminMainContent');
    
    content.innerHTML = `
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Results - Password Protected</h1>
            <p class="text-gray-600">View competition results and rankings</p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="mb-6">
                <div class="max-w-md">
                    <input type="password" id="resultsPassword" placeholder="Enter password" class="p-3 border rounded-lg w-full mb-4">
                    <button onclick="verifyResultsPassword()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full">
                        View Results
                    </button>
                </div>
            </div>
            <div id="resultsContent" class="hidden">
                <!-- Results content will be loaded here after password verification -->
            </div>
        </div>
    `;
}

async function verifyResultsPassword() {
    const password = document.getElementById('resultsPassword').value;
    const currentUser = getCurrentUser();
    
    if (password === 'admin123' || password === currentUser.password) {
        document.getElementById('resultsContent').classList.remove('hidden');
        await loadResultsContent();
        showNotification('Password verified');
    } else {
        showNotification('Invalid password', 'error');
    }
}

async function loadResultsContent() {
    const resultsContent = document.getElementById('resultsContent');
    
    try {
        const [teams, categories] = await Promise.all([
            supabase.from('teams').select('*').order('total_points', { ascending: false }),
            supabase.from('categories').select('*')
        ]);
        
        const stageResults = await supabase
            .from('results')
            .select(`
                *, 
                participants(*, teams(name)), 
                competitions(*, categories(*))
            `)
            .eq('status', 'published');
        
        const stagePoints = {};
        const nonStagePoints = {};
        
        stageResults.data?.forEach(result => {
            if (result.competitions?.is_stage_item && !result.competitions?.categories?.is_general) {
                const teamName = result.participants?.teams?.name;
                if (teamName) {
                    stagePoints[teamName] = (stagePoints[teamName] || 0) + (result.team_points || 0);
                }
            } else if (!result.competitions?.is_stage_item && !result.competitions?.categories?.is_general) {
                const teamName = result.participants?.teams?.name;
                if (teamName) {
                    nonStagePoints[teamName] = (nonStagePoints[teamName] || 0) + (result.team_points || 0);
                }
            }
        });
        
        const kalaprathipa = Object.entries(stagePoints).sort(([,a], [,b]) => b - a)[0];
        const sargaprathipa = Object.entries(nonStagePoints).sort(([,a], [,b]) => b - a)[0];
        
        resultsContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div class="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Overall Champion</h3>
                    <p class="text-2xl font-bold">${teams.data?.[0]?.name || 'N/A'}</p>
                    <p class="text-sm opacity-90">${teams.data?.[0]?.total_points || 0} points</p>
                </div>
                
                <div class="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-6 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Kalaprathipa (Stage Items)</h3>
                    <p class="text-2xl font-bold">${kalaprathipa?.[0] || 'N/A'}</p>
                    <p class="text-sm opacity-90">${kalaprathipa?.[1] || 0} points</p>
                </div>
                
                <div class="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Sargaprathipa (Non-Stage Items)</h3>
                    <p class="text-2xl font-bold">${sargaprathipa?.[0] || 'N/A'}</p>
                    <p class="text-sm opacity-90">${sargaprathipa?.[1] || 0} points</p>
                </div>
            </div>
            
            <div class="bg-white border rounded-lg">
                <div class="p-4 border-b">
                    <h3 class="text-lg font-semibold">Team Standings</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage Points</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Non-Stage Points</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${teams.data?.map((team, index) => `
                                <tr class="${index < 3 ? 'bg-yellow-50' : ''}">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="text-sm font-medium text-gray-900">
                                            ${index + 1}
                                            ${index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">${team.name}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900 font-semibold">${team.total_points}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">${stagePoints[team.name] || 0}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">${nonStagePoints[team.name] || 0}</div>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" class="text-center py-8 text-gray-500">No teams found</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Results loading error:', error);
        resultsContent.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-800 font-medium">Error loading results</div>
                <div class="text-red-600 text-sm mt-1">${error.message}</div>
            </div>
        `;
    }
}

async function showAdminSchedule() {
    setActiveNav('nav-schedule');
    const content = document.getElementById('adminMainContent');
    
    try {
        const [competitions, invigilators, schedules] = await Promise.all([
            supabase.from('competitions').select('*, categories(name)'),
            supabase.from('invigilators').select('*'),
            supabase.from('competitions').select('*, categories(name), competition_invigilators(*, invigilators(name))').order('scheduled_at', { ascending: true })
        ]);
        
        content.innerHTML = `
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Competition Schedule</h1>
                <p class="text-gray-600">Manage competition scheduling</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4">Schedule Competition</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <select id="scheduleCompetition" class="p-3 border rounded-lg">
                        <option value="">Select Competition</option>
                        ${competitions.data?.map(comp => `<option value="${comp.id}">${comp.name} (${comp.categories?.name})</option>`).join('') || ''}
                    </select>
                    <input type="datetime-local" id="scheduleDateTime" class="p-3 border rounded-lg">
                    <input type="text" id="stageNumber" placeholder="Stage Number" class="p-3 border rounded-lg">
                    <select id="scheduleInvigilator" class="p-3 border rounded-lg">
                        <option value="">Select Invigilator</option>
                        ${invigilators.data?.map(inv => `<option value="${inv.id}">${inv.name}</option>`).join('') || ''}
                    </select>
                    <button onclick="scheduleCompetition()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Schedule</button>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Scheduled Competitions</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invigilator</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${schedules.data?.map(comp => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${comp.name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${comp.categories?.name || 'N/A'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${comp.scheduled_at ? new Date(comp.scheduled_at).toLocaleString() : 'Not scheduled'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${comp.stage_number || 'N/A'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${comp.competition_invigilators?.[0]?.invigilators?.name || 'Not assigned'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs rounded ${getStatusColor(comp.status)}">
                                            ${comp.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onclick="updateCompetitionStatus('${comp.id}', 'ongoing')" class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">Start</button>
                                        <button onclick="updateCompetitionStatus('${comp.id}', 'completed')" class="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">Complete</button>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="7" class="text-center py-8 text-gray-500">No competitions scheduled</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Schedule loading error:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-800 font-medium">Error loading schedule</div>
                <div class="text-red-600 text-sm mt-1">${error.message}</div>
            </div>
        `;
    }
}

async function scheduleCompetition() {
    const competitionId = document.getElementById('scheduleCompetition').value;
    const dateTime = document.getElementById('scheduleDateTime').value;
    const stageNumber = document.getElementById('stageNumber').value.trim();
    const invigilatorId = document.getElementById('scheduleInvigilator').value;
    
    if (!competitionId || !dateTime) {
        showNotification('Please select competition and date/time', 'error');
        return;
    }
    
    try {
        // Update competition schedule
        const { error: compError } = await supabase
            .from('competitions')
            .update({ 
                scheduled_at: dateTime,
                stage_number: stageNumber || null
            })
            .eq('id', competitionId);
        
        if (compError) throw compError;
        
        // Assign invigilator if selected
        if (invigilatorId) {
            const { error: invError } = await supabase
                .from('competition_invigilators')
                .upsert({ 
                    competition_id: parseInt(competitionId), 
                    invigilator_id: parseInt(invigilatorId) 
                }, { 
                    onConflict: 'competition_id,invigilator_id' 
                });
            
            if (invError && !invError.message.includes('duplicate')) throw invError;
        }
        
        showNotification('Competition scheduled successfully');
        document.getElementById('scheduleCompetition').value = '';
        document.getElementById('scheduleDateTime').value = '';
        document.getElementById('stageNumber').value = '';
        document.getElementById('scheduleInvigilator').value = '';
        showAdminSchedule();
    } catch (error) {
        console.error('Scheduling error:', error);
        showNotification('Failed to schedule competition', 'error');
    }
}

async function updateCompetitionStatus(competitionId, status) {
    try {
        const { error } = await supabase
            .from('competitions')
            .update({ status })
            .eq('id', competitionId);
        
        if (error) throw error;
        
        showNotification(`Competition ${status} successfully`);
        showAdminSchedule();
    } catch (error) {
        console.error('Status update error:', error);
        showNotification('Failed to update competition status', 'error');
    }
}

async function showAdminSettings() {
    setActiveNav('nav-settings');
    const content = document.getElementById('adminMainContent');
    
    try {
        const settings = await supabase.from('settings').select('*');
        const maxStage = settings.data?.find(s => s.key === 'max_stage_registrations')?.value || '3';
        const maxNonStage = settings.data?.find(s => s.key === 'max_non_stage_registrations')?.value || '5';
        
        content.innerHTML = `
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
                <p class="text-gray-600">Application configuration and settings</p>
            </div>

            <div class="space-y-6">
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold mb-4">Participant Registration Limits</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Max Stage Item Registrations:</label>
                            <input type="number" id="maxStageReg" value="${maxStage}" min="1" class="p-3 border rounded-lg w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Max Non-Stage Item Registrations:</label>
                            <input type="number" id="maxNonStageReg" value="${maxNonStage}" min="1" class="p-3 border rounded-lg w-full">
                        </div>
                        <div class="flex items-end">
                            <button onclick="updateRegistrationLimits()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full">Update Limits</button>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold mb-4">Team Leader Access Control</h3>
                    <div class="space-x-4">
                        <button onclick="enableAllTeamAccess()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                            Enable All Teams
                        </button>
                        <button onclick="disableAllTeamAccess()" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
                            Disable All Teams
                        </button>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">Control access to setup for team leaders</p>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold mb-4">System Information</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Version:</span>
                            <span>2.1.0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Database:</span>
                            <span class="text-green-600">Connected</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Last Updated:</span>
                            <span>${new Date().toLocaleDateString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Status:</span>
                            <span class="text-green-600">Active</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
                    <div class="space-x-4">
                        <button onclick="resetAllResults()" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
                            Reset All Results
                        </button>
                        <button onclick="clearAllData()" class="bg-red-800 text-white px-6 py-3 rounded-lg hover:bg-red-900">
                            Clear All Data
                        </button>
                    </div>
                    <p class="text-sm text-red-600 mt-2">These actions cannot be undone. Use with extreme caution.</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Settings loading error:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-800 font-medium">Error loading settings</div>
                <div class="text-red-600 text-sm mt-1">${error.message}</div>
            </div>
        `;
    }
}

async function updateRegistrationLimits() {
    try {
        const maxStage = document.getElementById('maxStageReg').value;
        const maxNonStage = document.getElementById('maxNonStageReg').value;
        
        const updates = [
            { key: 'max_stage_registrations', value: maxStage },
            { key: 'max_non_stage_registrations', value: maxNonStage }
        ];
        
        for (const update of updates) {
            await supabase
                .from('settings')
                .upsert(update, { onConflict: 'key' });
        }
        
        showNotification('Registration limits updated successfully');
    } catch (error) {
        console.error('Settings update error:', error);
        showNotification('Failed to update settings', 'error');
    }
}

async function enableAllTeamAccess() {
    if (!confirm('Enable access for all teams?')) return;
    
    try {
        const { error } = await supabase
            .from('teams')
            .update({ leader_access: true })
            .neq('id', 0);
        
        if (error) throw error;
        
        showNotification('All teams now have leader access');
    } catch (error) {
        console.error('Team access error:', error);
        showNotification('Failed to enable team access', 'error');
    }
}

async function disableAllTeamAccess() {
    if (!confirm('Disable access for all teams?')) return;
    
    try {
        const { error } = await supabase
            .from('teams')
            .update({ leader_access: false })
            .neq('id', 0);
        
        if (error) throw error;
        
        showNotification('All teams access disabled');
    } catch (error) {
        console.error('Team access error:', error);
        showNotification('Failed to disable team access', 'error');
    }
}

async function resetAllResults() {
    if (!confirm('This will delete all results and reset team points. Continue?')) return;
    
    try {
        const { error } = await supabase
            .from('results')
            .delete()
            .neq('id', 0);
        
        if (!error) {
            await supabase
                .from('teams')
                .update({ total_points: 0 })
                .neq('id', 0);
            
            showNotification('All results reset successfully');
        }
    } catch (error) {
        console.error('Reset error:', error);
        showNotification('Failed to reset results', 'error');
    }
}

async function clearAllData() {
    const confirmation = prompt('Type "DELETE ALL DATA" to confirm this action:');
    if (confirmation !== 'DELETE ALL DATA') {
        showNotification('Action cancelled', 'error');
        return;
    }
    
    showNotification('This feature is disabled for safety', 'error');
}
