// admin-setup.js - Complete Admin Setup Module with Enhanced Competition & Participant Management

// Global variable to store realtime subscriptions
let realtimeSubscriptions = [];

async function showTeamsManagement() {
    setActiveNav('nav-teams');
    const content = document.getElementById('adminMainContent');
    
    try {
        const { data: teams, error } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
        
        if (error) throw error;
        
        content.innerHTML = `
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Teams Management</h1>
                <p class="text-gray-600">Create and manage teams</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4">Create Team</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input type="text" id="teamName" placeholder="Team Name" class="p-3 border rounded-lg">
                    <input type="password" id="teamPassword" placeholder="Team Password" class="p-3 border rounded-lg">
                    <button onclick="createTeam()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Create Team</button>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Teams (<span id="teamsCount">${teams?.length || 0}</span>)</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leader Access</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="teamsTableBody">
                            ${renderTeamsTableBody(teams)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        setupTeamsRealtime();
        
    } catch (error) {
        console.error('Teams loading error:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-800 font-medium">Error loading teams</div>
                <div class="text-red-600 text-sm mt-1">${error.message}</div>
            </div>
        `;
    }
}

function renderTeamsTableBody(teams) {
    return teams?.map(team => `
        <tr id="team-row-${team.id}">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <input type="text" id="teamName_${team.id}" value="${team.name}" class="border rounded px-2 py-1 mr-2">
                    <button onclick="updateTeamName(${team.id})" class="text-blue-600 hover:text-blue-800 text-sm">Update</button>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${team.total_points}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded ${team.leader_access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${team.leader_access ? 'Enabled' : 'Disabled'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="toggleLeaderAccess(${team.id}, ${!team.leader_access})" 
                        class="px-3 py-1 rounded text-sm ${team.leader_access ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}">
                    ${team.leader_access ? 'Disable Access' : 'Enable Access'}
                </button>
                <button onclick="deleteTeam(${team.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="4" class="text-center py-8 text-gray-500">No teams found</td></tr>';
}

function setupTeamsRealtime() {
    cleanupRealtimeSubscriptions();
    
    const teamsChannel = supabase
        .channel('public:teams')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, async (payload) => {
            console.log('Teams change received:', payload);
            await refreshTeamsData();
        })
        .subscribe();
    
    realtimeSubscriptions.push(teamsChannel);
}

async function refreshTeamsData() {
    try {
        const { data: teams, error } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        const countElement = document.getElementById('teamsCount');
        if (countElement) {
            countElement.textContent = teams?.length || 0;
        }
        
        const tableBody = document.getElementById('teamsTableBody');
        if (tableBody) {
            tableBody.innerHTML = renderTeamsTableBody(teams);
        }
    } catch (error) {
        console.error('Error refreshing teams data:', error);
    }
}

async function updateTeamName(teamId) {
    const newName = document.getElementById(`teamName_${teamId}`).value.trim();
    if (!newName) {
        showNotification('Team name cannot be empty', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('teams')
            .update({ name: newName })
            .eq('id', teamId);
        
        if (error) throw error;
        
        showNotification('Team name updated successfully');
    } catch (error) {
        console.error('Team name update error:', error);
        showNotification('Failed to update team name', 'error');
    }
}

async function createTeam() {
    const name = document.getElementById('teamName').value.trim();
    const password = document.getElementById('teamPassword').value.trim();
    
    if (!name || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('teams')
            .insert({ name, password });
        
        if (error) throw error;
        
        showNotification('Team created successfully');
        document.getElementById('teamName').value = '';
        document.getElementById('teamPassword').value = '';
    } catch (error) {
        console.error('Team creation error:', error);
        if (error.message.includes('duplicate')) {
            showNotification('Team name already exists', 'error');
        } else {
            showNotification('Failed to create team', 'error');
        }
    }
}

async function toggleLeaderAccess(teamId, access) {
    try {
        const { error } = await supabase
            .from('teams')
            .update({ leader_access: access })
            .eq('id', teamId);
        
        if (error) throw error;
        
        showNotification('Team access updated');
    } catch (error) {
        console.error('Team access update error:', error);
        showNotification('Failed to update team access', 'error');
    }
}

async function deleteTeam(teamId) {
    if (!confirm('Are you sure you want to delete this team? This will also delete all associated participants.')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('teams')
            .delete()
            .eq('id', teamId);
        
        if (error) throw error;
        
        showNotification('Team deleted successfully');
    } catch (error) {
        console.error('Team deletion error:', error);
        showNotification('Failed to delete team', 'error');
    }
}

async function showCategoriesManagement() {
    setActiveNav('nav-categories');
    const content = document.getElementById('adminMainContent');
    
    try {
        const { data: categories, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
        
        if (error) throw error;
        
        content.innerHTML = `
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Categories Management</h1>
                <p class="text-gray-600">Create and manage competition categories</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4">Create Category</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" id="categoryName" placeholder="Category Name" class="p-3 border rounded-lg">
                    <div class="flex items-center">
                        <label class="flex items-center">
                            <input type="checkbox" id="isGeneral" class="mr-2">
                            <span class="text-sm">General Category</span>
                        </label>
                    </div>
                    <button onclick="createCategory()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Create Category</button>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Categories (<span id="categoriesCount">${categories?.length || 0}</span>)</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="categoriesTableBody">
                            ${renderCategoriesTableBody(categories)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        setupCategoriesRealtime();
        
    } catch (error) {
        console.error('Categories loading error:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-800 font-medium">Error loading categories</div>
                <div class="text-red-600 text-sm mt-1">${error.message}</div>
            </div>
        `;
    }
}

function renderCategoriesTableBody(categories) {
    return categories?.map(category => `
        <tr id="category-row-${category.id}">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${category.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded ${category.is_general ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                    ${category.is_general ? 'General' : 'Regular'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="deleteCategory(${category.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="3" class="text-center py-8 text-gray-500">No categories found</td></tr>';
}

function setupCategoriesRealtime() {
    cleanupRealtimeSubscriptions();
    
    const categoriesChannel = supabase
        .channel('public:categories')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async (payload) => {
            console.log('Categories change received:', payload);
            await refreshCategoriesData();
        })
        .subscribe();
    
    realtimeSubscriptions.push(categoriesChannel);
}

async function refreshCategoriesData() {
    try {
        const { data: categories, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        const countElement = document.getElementById('categoriesCount');
        if (countElement) {
            countElement.textContent = categories?.length || 0;
        }
        
        const tableBody = document.getElementById('categoriesTableBody');
        if (tableBody) {
            tableBody.innerHTML = renderCategoriesTableBody(categories);
        }
    } catch (error) {
        console.error('Error refreshing categories data:', error);
    }
}

async function createCategory() {
    const name = document.getElementById('categoryName').value.trim();
    const isGeneral = document.getElementById('isGeneral').checked;
    
    if (!name) {
        showNotification('Please enter category name', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert({ name, is_general: isGeneral });
        
        if (error) throw error;
        
        showNotification('Category created successfully');
        document.getElementById('categoryName').value = '';
        document.getElementById('isGeneral').checked = false;
    } catch (error) {
        console.error('Category creation error:', error);
        showNotification('Failed to create category', 'error');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);
        
        if (error) throw error;
        
        showNotification('Category deleted successfully');
    } catch (error) {
        console.error('Category deletion error:', error);
        showNotification('Failed to delete category', 'error');
    }
}

async function showParticipantsManagement() {
    setActiveNav('nav-participants');
    const content = document.getElementById('adminMainContent');
    
    try {
        const [categories, teams, allParticipants] = await Promise.all([
            supabase.from('categories').select('*').eq('is_general', false),
            supabase.from('teams').select('*').order('id'),
            supabase.from('participants').select('*, teams(name), categories(name)').order('name')
        ]);
        
        content.innerHTML = `
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Participants Management</h1>
                <p class="text-gray-600">Manage participants with competition tracking</p>
            </div>

            <!-- Category Filter -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4">Filter Participants</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select id="participantCategoryFilter" onchange="filterParticipantsByCategory()" class="p-3 border rounded-lg">
                        <option value="">All Categories</option>
                        ${categories.data?.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('') || ''}
                    </select>
                    <select id="participantTeamFilter" onchange="filterParticipantsByTeam()" class="p-3 border rounded-lg">
                        <option value="">All Teams</option>
                        ${teams.data?.map(team => `<option value="${team.id}">${team.name}</option>`).join('') || ''}
                    </select>
                    <input type="text" id="participantNameFilter" onkeyup="filterParticipantsByName()" placeholder="Search by name" class="p-3 border rounded-lg">
                </div>
            </div>

            <!-- Participants List -->
            <div class="bg-white rounded-lg shadow-sm">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">All Participants (<span id="participantsCount">${allParticipants.data?.length || 0}</span>)</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chest No.</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitions</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="participantsTableBody">
                            ${await renderParticipantsTableBodyWithCounts(allParticipants.data)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Participant Competitions Modal -->
            <div id="participantCompetitionsModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-medium text-gray-900" id="modalParticipantName">Participant Competitions</h3>
                            <button onclick="closeParticipantModal()" class="text-gray-400 hover:text-gray-600">
                                <span class="sr-only">Close</span>
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="mb-4">
                            <input type="text" id="competitionSearchFilter" onkeyup="filterParticipantCompetitions()" placeholder="Search competitions..." class="w-full p-2 border rounded-lg">
                        </div>
                        <div id="participantCompetitionsList" class="max-h-96 overflow-y-auto">
                            <!-- Competitions will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        await loadParticipantCompetitionCounts();
        setupParticipantsRealtime();
        
    } catch (error) {
        console.error('Participants management loading error:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-800 font-medium">Error loading participants management</div>
                <div class="text-red-600 text-sm mt-1">${error.message}</div>
            </div>
        `;
    }
}

async function renderParticipantsTableBodyWithCounts(participants) {
    // Get competition counts for all participants
    const participantIds = participants?.map(p => p.id) || [];
    let competitionCounts = {};
    
    if (participantIds.length > 0) {
        const { data: registrations } = await supabase
            .from('participant_competitions')
            .select('participant_id')
            .in('participant_id', participantIds);
        
        // Count competitions per participant
        registrations?.forEach(reg => {
            competitionCounts[reg.participant_id] = (competitionCounts[reg.participant_id] || 0) + 1;
        });
    }

    return participants?.map(participant => `
        <tr id="participant-row-${participant.id}" data-category="${participant.category_id}" data-team="${participant.team_id}" data-name="${participant.name.toLowerCase()}">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${participant.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${participant.teams?.name || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${participant.categories?.name || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${participant.chest_number || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button onclick="showParticipantCompetitions(${participant.id}, '${participant.name}')" class="text-blue-600 hover:text-blue-900 font-medium">
                    ${competitionCounts[participant.id] || 0} competitions
                </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="deleteParticipant(${participant.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6" class="text-center py-8 text-gray-500">No participants found</td></tr>';
}

async function loadParticipantCompetitionCounts() {
    // Refresh competition counts for all visible participants
    const participantRows = document.querySelectorAll('[id^="participant-row-"]');
    const participantIds = Array.from(participantRows).map(row => row.id.replace('participant-row-', ''));
    
    if (participantIds.length > 0) {
        const { data: registrations } = await supabase
            .from('participant_competitions')
            .select('participant_id')
            .in('participant_id', participantIds);
        
        let competitionCounts = {};
        registrations?.forEach(reg => {
            competitionCounts[reg.participant_id] = (competitionCounts[reg.participant_id] || 0) + 1;
        });
        
        // Update the UI
        participantRows.forEach(row => {
            const participantId = row.id.replace('participant-row-', '');
            const competitionCell = row.querySelector('button[onclick^="showParticipantCompetitions"]');
            if (competitionCell) {
                const count = competitionCounts[participantId] || 0;
                competitionCell.textContent = `${count} competitions`;
            }
        });
    }
}

function filterParticipantsByCategory() {
    const categoryFilter = document.getElementById('participantCategoryFilter').value;
    filterParticipants();
}

function filterParticipantsByTeam() {
    const teamFilter = document.getElementById('participantTeamFilter').value;
    filterParticipants();
}

function filterParticipantsByName() {
    const nameFilter = document.getElementById('participantNameFilter').value.toLowerCase();
    filterParticipants();
}

function filterParticipants() {
    const categoryFilter = document.getElementById('participantCategoryFilter')?.value || '';
    const teamFilter = document.getElementById('participantTeamFilter')?.value || '';
    const nameFilter = document.getElementById('participantNameFilter')?.value.toLowerCase() || '';
    
    const rows = document.querySelectorAll('[id^="participant-row-"]');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const categoryMatch = !categoryFilter || row.dataset.category === categoryFilter;
        const teamMatch = !teamFilter || row.dataset.team === teamFilter;
        const nameMatch = !nameFilter || row.dataset.name.includes(nameFilter);
        
        if (categoryMatch && teamMatch && nameMatch) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update visible count
    const countElement = document.getElementById('participantsCount');
    if (countElement) {
        countElement.textContent = visibleCount;
    }
}

async function showParticipantCompetitions(participantId, participantName) {
    document.getElementById('modalParticipantName').textContent = `${participantName} - Registered Competitions`;
    
    try {
        const { data: competitions, error } = await supabase
            .from('participant_competitions')
            .select('competitions(id, name, categories(name), is_stage_item, is_group_item)')
            .eq('participant_id', participantId)
            .order('competitions(name)');
        
        if (error) throw error;
        
        const competitionsList = document.getElementById('participantCompetitionsList');
        
        if (!competitions || competitions.length === 0) {
            competitionsList.innerHTML = '<div class="text-center py-8 text-gray-500">No competitions registered</div>';
        } else {
            competitionsList.innerHTML = competitions.map(comp => {
                const competition = comp.competitions;
                return `
                    <div class="competition-item border rounded-lg p-4 mb-3" data-name="${competition.name.toLowerCase()}">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-medium text-gray-900">${competition.name}</h4>
                                <p class="text-sm text-gray-500">${competition.categories?.name}</p>
                                <div class="flex gap-2 mt-2">
                                    <span class="px-2 py-1 text-xs rounded ${competition.is_stage_item ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                        ${competition.is_stage_item ? 'Stage' : 'Non-Stage'}
                                    </span>
                                    <span class="px-2 py-1 text-xs rounded ${competition.is_group_item ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                                        ${competition.is_group_item ? 'Group' : 'Individual'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        document.getElementById('participantCompetitionsModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading participant competitions:', error);
        showNotification('Failed to load competitions', 'error');
    }
}

function filterParticipantCompetitions() {
    const searchTerm = document.getElementById('competitionSearchFilter').value.toLowerCase();
    const competitionItems = document.querySelectorAll('#participantCompetitionsList .competition-item');
    
    competitionItems.forEach(item => {
        if (item.dataset.name.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function closeParticipantModal() {
    document.getElementById('participantCompetitionsModal').classList.add('hidden');
    document.getElementById('competitionSearchFilter').value = '';
}

function setupParticipantsRealtime() {
    cleanupRealtimeSubscriptions();
    
    const participantsChannel = supabase
        .channel('public:participants')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, async (payload) => {
            console.log('Participants change received:', payload);
            await refreshParticipantsData();
        })
        .subscribe();
    
    const registrationsChannel = supabase
        .channel('public:participant_competitions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'participant_competitions' }, async (payload) => {
            console.log('Registrations change received:', payload);
            await loadParticipantCompetitionCounts();
        })
        .subscribe();
    
    realtimeSubscriptions.push(participantsChannel, registrationsChannel);
}

async function refreshParticipantsData() {
    try {
        const { data: participants, error } = await supabase
            .from('participants')
            .select('*, teams(name), categories(name)')
            .order('name');
        
        if (error) throw error;
        
        const tableBody = document.getElementById('participantsTableBody');
        if (tableBody) {
            tableBody.innerHTML = await renderParticipantsTableBodyWithCounts(participants);
        }
        
        // Reset filters
        const categoryFilter = document.getElementById('participantCategoryFilter');
        const teamFilter = document.getElementById('participantTeamFilter');
        const nameFilter = document.getElementById('participantNameFilter');
        
        if (categoryFilter) categoryFilter.value = '';
        if (teamFilter) teamFilter.value = '';
        if (nameFilter) nameFilter.value = '';
        
        filterParticipants();
        
    } catch (error) {
        console.error('Error refreshing participants data:', error);
    }
}

async function deleteParticipant(participantId) {
    if (!confirm('Are you sure you want to delete this participant?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('participants')
            .delete()
            .eq('id', participantId);
        
        if (error) throw error;
        
        showNotification('Participant deleted successfully');
    } catch (error) {
        console.error('Participant deletion error:', error);
        showNotification('Failed to delete participant', 'error');
    }
}

async function showCompetitionsManagement() {
    setActiveNav('nav-competitions');
    const content = document.getElementById('adminMainContent');
    
    try {
        const [categories, competitions] = await Promise.all([
            supabase.from('categories').select('*'),
            supabase.from('competitions').select('*, categories(name)').order('name')
        ]);
        
        content.innerHTML = `
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Competitions Management</h1>
                <p class="text-gray-600">Manage competitions and view registrations</p>
            </div>

            <!-- Category Filter -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4">Filter Competitions</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select id="competitionCategoryFilter" onchange="filterCompetitionsByCategory()" class="p-3 border rounded-lg">
                        <option value="">All Categories</option>
                        ${categories.data?.map(cat => `<option value="${cat.id}">${cat.name} ${cat.is_general ? '(General)' : ''}</option>`).join('') || ''}
                    </select>
                    <select id="competitionTypeFilter" onchange="filterCompetitionsByType()" class="p-3 border rounded-lg">
                        <option value="">All Types</option>
                        <option value="stage">Stage Items</option>
                        <option value="non-stage">Non-Stage Items</option>
                        <option value="group">Group Items</option>
                        <option value="individual">Individual Items</option>
                    </select>
                    <input type="text" id="competitionNameFilter" onkeyup="filterCompetitionsByName()" placeholder="Search by name" class="p-3 border rounded-lg">
                </div>
            </div>

            <!-- Competitions List -->
            <div class="bg-white rounded-lg shadow-sm">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">All Competitions (<span id="competitionsCount">${competitions.data?.length || 0}</span>)</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max per Team</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="competitionsTableBody">
                            ${await renderCompetitionsTableBodyWithCounts(competitions.data)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Competition Participants Modal -->
            <div id="competitionParticipantsModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-medium text-gray-900" id="modalCompetitionName">Competition Participants</h3>
                            <button onclick="closeCompetitionModal()" class="text-gray-400 hover:text-gray-600">
                                <span class="sr-only">Close</span>
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="mb-4">
                            <input type="text" id="participantSearchFilter" onkeyup="filterCompetitionParticipants()" placeholder="Search participants..." class="w-full p-2 border rounded-lg">
                        </div>
                        <div id="competitionParticipantsList" class="max-h-96 overflow-y-auto">
                            <!-- Participants will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        await loadCompetitionParticipantCounts();
        setupCompetitionsRealtime();
        
    } catch (error) {
        console.error('Competitions management loading error:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-800 font-medium">Error loading competitions management</div>
                <div class="text-red-600 text-sm mt-1">${error.message}</div>
            </div>
        `;
    }
}

async function renderCompetitionsTableBodyWithCounts(competitions) {
    // Get participant counts for all competitions
    const competitionIds = competitions?.map(c => c.id) || [];
    let participantCounts = {};
    
    if (competitionIds.length > 0) {
        const { data: registrations } = await supabase
            .from('participant_competitions')
            .select('competition_id')
            .in('competition_id', competitionIds);
        
        // Count participants per competition
        registrations?.forEach(reg => {
            participantCounts[reg.competition_id] = (participantCounts[reg.competition_id] || 0) + 1;
        });
    }

    return competitions?.map(competition => `
        <tr id="competition-row-${competition.id}" data-category="${competition.category_id}" data-stage="${competition.is_stage_item}" data-group="${competition.is_group_item}" data-name="${competition.name.toLowerCase()}">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${competition.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${competition.categories?.name || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="space-x-1">
                    <span class="px-2 py-1 text-xs rounded ${competition.is_stage_item ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${competition.is_stage_item ? 'Stage' : 'Non-Stage'}
                    </span>
                    <span class="px-2 py-1 text-xs rounded ${competition.is_group_item ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                        ${competition.is_group_item ? 'Group' : 'Individual'}
                    </span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${competition.max_participants_per_team || 'Unlimited'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button onclick="showCompetitionParticipants(${competition.id}, '${competition.name}')" class="text-blue-600 hover:text-blue-900 font-medium">
                    ${participantCounts[competition.id] || 0} participants
                </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="deleteCompetition(${competition.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6" class="text-center py-8 text-gray-500">No competitions found</td></tr>';
}

async function loadCompetitionParticipantCounts() {
    // Refresh participant counts for all visible competitions
    const competitionRows = document.querySelectorAll('[id^="competition-row-"]');
    const competitionIds = Array.from(competitionRows).map(row => row.id.replace('competition-row-', ''));
    
    if (competitionIds.length > 0) {
        const { data: registrations } = await supabase
            .from('participant_competitions')
            .select('competition_id')
            .in('competition_id', competitionIds);
        
        let participantCounts = {};
        registrations?.forEach(reg => {
            participantCounts[reg.competition_id] = (participantCounts[reg.competition_id] || 0) + 1;
        });
        
        // Update the UI
        competitionRows.forEach(row => {
            const competitionId = row.id.replace('competition-row-', '');
            const participantCell = row.querySelector('button[onclick^="showCompetitionParticipants"]');
            if (participantCell) {
                const count = participantCounts[competitionId] || 0;
                participantCell.textContent = `${count} participants`;
            }
        });
    }
}

function filterCompetitionsByCategory() {
    filterCompetitions();
}

function filterCompetitionsByType() {
    filterCompetitions();
}

function filterCompetitionsByName() {
    filterCompetitions();
}

function filterCompetitions() {
    const categoryFilter = document.getElementById('competitionCategoryFilter')?.value || '';
    const typeFilter = document.getElementById('competitionTypeFilter')?.value || '';
    const nameFilter = document.getElementById('competitionNameFilter')?.value.toLowerCase() || '';
    
    const rows = document.querySelectorAll('[id^="competition-row-"]');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const categoryMatch = !categoryFilter || row.dataset.category === categoryFilter;
        const nameMatch = !nameFilter || row.dataset.name.includes(nameFilter);
        
        let typeMatch = true;
        if (typeFilter) {
            switch (typeFilter) {
                case 'stage':
                    typeMatch = row.dataset.stage === 'true';
                    break;
                case 'non-stage':
                    typeMatch = row.dataset.stage === 'false';
                    break;
                case 'group':
                    typeMatch = row.dataset.group === 'true';
                    break;
                case 'individual':
                    typeMatch = row.dataset.group === 'false';
                    break;
            }
        }
        
        if (categoryMatch && typeMatch && nameMatch) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update visible count
    const countElement = document.getElementById('competitionsCount');
    if (countElement) {
        countElement.textContent = visibleCount;
    }
}

async function showCompetitionParticipants(competitionId, competitionName) {
    document.getElementById('modalCompetitionName').textContent = `${competitionName} - Registered Participants`;
    
    try {
        const { data: participants, error } = await supabase
            .from('participant_competitions')
            .select('participants(id, name, chest_number, teams(name)), teams(name)')
            .eq('competition_id', competitionId)
            .order('teams(name), participants(name)');
        
        if (error) throw error;
        
        const participantsList = document.getElementById('competitionParticipantsList');
        
        if (!participants || participants.length === 0) {
            participantsList.innerHTML = '<div class="text-center py-8 text-gray-500">No participants registered</div>';
        } else {
            // Group participants by team
            const participantsByTeam = {};
            participants.forEach(p => {
                const teamName = p.teams?.name || p.participants.teams?.name || 'Unknown Team';
                if (!participantsByTeam[teamName]) {
                    participantsByTeam[teamName] = [];
                }
                participantsByTeam[teamName].push(p.participants);
            });
            
            participantsList.innerHTML = Object.keys(participantsByTeam).map(teamName => `
                <div class="team-group mb-4 border rounded-lg p-4" data-team="${teamName.toLowerCase()}">
                    <h4 class="font-semibold text-gray-900 mb-3">${teamName} (${participantsByTeam[teamName].length} participants)</h4>
                    <div class="space-y-2">
                        ${participantsByTeam[teamName].map(participant => `
                            <div class="participant-item flex justify-between items-center p-2 bg-gray-50 rounded" data-name="${participant.name.toLowerCase()}">
                                <div>
                                    <span class="font-medium text-gray-900">${participant.name}</span>
                                    <span class="text-sm text-gray-500 ml-2">Chest #${participant.chest_number || 'N/A'}</span>
                                </div>
                                <button onclick="showParticipantCompetitions(${participant.id}, '${participant.name}')" class="text-blue-600 hover:text-blue-900 text-sm">
                                    View Competitions
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
        
        document.getElementById('competitionParticipantsModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading competition participants:', error);
        showNotification('Failed to load participants', 'error');
    }
}

function filterCompetitionParticipants() {
    const searchTerm = document.getElementById('participantSearchFilter').value.toLowerCase();
    const teamGroups = document.querySelectorAll('#competitionParticipantsList .team-group');
    
    teamGroups.forEach(teamGroup => {
        const teamName = teamGroup.dataset.team;
        const participantItems = teamGroup.querySelectorAll('.participant-item');
        let visibleParticipants = 0;
        
        participantItems.forEach(item => {
            const participantName = item.dataset.name;
            if (participantName.includes(searchTerm) || teamName.includes(searchTerm)) {
                item.style.display = '';
                visibleParticipants++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show/hide team group based on visible participants
        if (visibleParticipants > 0 || teamName.includes(searchTerm)) {
            teamGroup.style.display = '';
        } else {
            teamGroup.style.display = 'none';
        }
    });
}

function closeCompetitionModal() {
    document.getElementById('competitionParticipantsModal').classList.add('hidden');
    document.getElementById('participantSearchFilter').value = '';
}

function setupCompetitionsRealtime() {
    cleanupRealtimeSubscriptions();
    
    const competitionsChannel = supabase
        .channel('public:competitions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions' }, async (payload) => {
            console.log('Competitions change received:', payload);
            await refreshCompetitionsData();
        })
        .subscribe();
    
    const registrationsChannel = supabase
        .channel('public:participant_competitions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'participant_competitions' }, async (payload) => {
            console.log('Registrations change received:', payload);
            await loadCompetitionParticipantCounts();
        })
        .subscribe();
    
    realtimeSubscriptions.push(competitionsChannel, registrationsChannel);
}

async function refreshCompetitionsData() {
    try {
        const { data: competitions, error } = await supabase
            .from('competitions')
            .select('*, categories(name)')
            .order('name');
        
        if (error) throw error;
        
        const tableBody = document.getElementById('competitionsTableBody');
        if (tableBody) {
            tableBody.innerHTML = await renderCompetitionsTableBodyWithCounts(competitions);
        }
        
        // Reset filters
        const categoryFilter = document.getElementById('competitionCategoryFilter');
        const typeFilter = document.getElementById('competitionTypeFilter');
        const nameFilter = document.getElementById('competitionNameFilter');
        
        if (categoryFilter) categoryFilter.value = '';
        if (typeFilter) typeFilter.value = '';
        if (nameFilter) nameFilter.value = '';
        
        filterCompetitions();
        
    } catch (error) {
        console.error('Error refreshing competitions data:', error);
    }
}

async function deleteCompetition(competitionId) {
    if (!confirm('Are you sure you want to delete this competition?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('competitions')
            .delete()
            .eq('id', competitionId);
        
        if (error) throw error;
        
        showNotification('Competition deleted successfully');
    } catch (error) {
        console.error('Competition deletion error:', error);
        showNotification('Failed to delete competition', 'error');
    }
}

// Utility function to clean up realtime subscriptions
function cleanupRealtimeSubscriptions() {
    realtimeSubscriptions.forEach(subscription => {
        supabase.removeChannel(subscription);
    });
    realtimeSubscriptions = [];
}

// Clean up subscriptions when navigating away
window.addEventListener('beforeunload', cleanupRealtimeSubscriptions);

// Global function assignments
window.showTeamsManagement = showTeamsManagement;
window.updateTeamName = updateTeamName;
window.createTeam = createTeam;
window.toggleLeaderAccess = toggleLeaderAccess;
window.deleteTeam = deleteTeam;
window.showCategoriesManagement = showCategoriesManagement;
window.createCategory = createCategory;
window.deleteCategory = deleteCategory;
window.showParticipantsManagement = showParticipantsManagement;
window.filterParticipantsByCategory = filterParticipantsByCategory;
window.filterParticipantsByTeam = filterParticipantsByTeam;
window.filterParticipantsByName = filterParticipantsByName;
window.showParticipantCompetitions = showParticipantCompetitions;
window.filterParticipantCompetitions = filterParticipantCompetitions;
window.closeParticipantModal = closeParticipantModal;
window.deleteParticipant = deleteParticipant;
window.showCompetitionsManagement = showCompetitionsManagement;
window.filterCompetitionsByCategory = filterCompetitionsByCategory;
window.filterCompetitionsByType = filterCompetitionsByType;
window.filterCompetitionsByName = filterCompetitionsByName;
window.showCompetitionParticipants = showCompetitionParticipants;
window.filterCompetitionParticipants = filterCompetitionParticipants;
window.closeCompetitionModal = closeCompetitionModal;
window.deleteCompetition = deleteCompetition;
