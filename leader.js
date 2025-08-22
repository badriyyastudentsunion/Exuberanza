// team-leader.js - Team Leader Dashboard (Fixed Version)

// Global state management to prevent issues
window.leaderState = {
    isModalOpen: false,
    isProcessing: false,
    participants: [],
    competitions: [],
    categories: [],
    maxStage: 3,
    maxNonStage: 5,
    teamId: null
};

async function loadTeamLeaderContent(content, user) {
    // Check if team has access
    const { data: teamData } = await supabase.from('teams').select('leader_access').eq('id', user.id).single();
    
    if (!teamData || !teamData.leader_access) {
        content.innerHTML = `
            <div class="flex items-center justify-center min-h-screen bg-gray-50">
                <div class="bg-white rounded-lg shadow-lg p-8 m-4 text-center max-w-md">
                    <div class="text-red-500 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <h2 class="text-xl font-bold text-gray-900 mb-2">Access Disabled</h2>
                    <p class="text-gray-600 mb-4">Your team leader access has been disabled by the administrator.</p>
                    <p class="text-sm text-gray-500">Please contact the admin for assistance.</p>
                </div>
            </div>
        `;
        return;
    }

    // Fetch all required data
    try {
        const [participantsResp, competitionsResp, categoriesResp, settingsResp] = await Promise.all([
            supabase.from('participants').select('*, categories(name, is_general)').eq('team_id', user.id),
            supabase.from('competitions').select('*, categories(name, is_general, id)').order('category_id'),
            supabase.from('categories').select('*').order('id'),
            supabase.from('settings').select('*')
        ]);

        const participants = participantsResp.data || [];
        const competitions = competitionsResp.data || [];
        const categories = categoriesResp.data || [];
        const settings = settingsResp.data || [];

        const maxStage = parseInt(settings.find(s => s.key === 'max_stage_registrations')?.value || '3');
        const maxNonStage = parseInt(settings.find(s => s.key === 'max_non_stage_registrations')?.value || '5');

        // Update global state
        window.leaderState = {
            ...window.leaderState,
            participants,
            competitions,
            categories,
            maxStage,
            maxNonStage,
            teamId: user.id
        };

        renderTeamLeaderDashboard(content, user);
    } catch (error) {
        console.error('Error loading team leader content:', error);
        content.innerHTML = `<div class="bg-red-50 p-4 rounded">Error loading data: ${error.message}</div>`;
    }
}

function renderTeamLeaderDashboard(content, user) {
    content.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-50">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-xl font-bold">${user.name}</h1>
                        <p class="text-blue-100 text-sm">Points: ${user.total_points}</p>
                    </div>
                    <button onclick="logout()" class="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
                        Logout
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="bg-white border-b sticky top-16 z-40">
                <div class="flex">
                    <button class="tab-btn active flex-1 py-4 px-4 font-medium text-center" id="tab-participants" onclick="switchTab('participants')">
                        <span class="block">Participants</span>
                        <span class="text-xs text-gray-500">${window.leaderState.participants.length}</span>
                    </button>
                    <button class="tab-btn flex-1 py-4 px-4 font-medium text-center" id="tab-competitions" onclick="switchTab('competitions')">
                        <span class="block">Competitions</span>
                        <span class="text-xs text-gray-500">${window.leaderState.competitions.length}</span>
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div id="leaderContent" class="p-4 pb-20">
                <!-- Content will be loaded here -->
            </div>
        </div>

        <style>
            .tab-btn {
                background: transparent;
                border: none;
                border-bottom: 3px solid transparent;
                color: #6B7280;
                transition: all 0.2s;
            }
            .tab-btn.active {
                color: #3B82F6;
                border-bottom-color: #3B82F6;
            }
            .card {
                background: white;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                border: 1px solid #F3F4F6;
                cursor: pointer;
                transition: transform 0.1s;
            }
            .card:hover {
                transform: translateY(-1px);
            }
            .card:active {
                transform: scale(0.98);
            }
            .filter-chip {
                display: inline-block;
                padding: 8px 16px;
                margin: 4px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid #E5E7EB;
                background: white;
                color: #6B7280;
            }
            .filter-chip.active {
                background: #3B82F6;
                color: white;
                border-color: #3B82F6;
            }
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 16px;
            }
            .modal-content {
                background: white;
                border-radius: 16px;
                max-width: 400px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
            }
            .btn {
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .btn-primary {
                background: #3B82F6;
                color: white;
            }
            .btn-primary:hover:not(:disabled) {
                background: #2563EB;
            }
            .btn-secondary {
                background: #F3F4F6;
                color: #374151;
            }
            .progress-bar {
                width: 100%;
                height: 6px;
                background: #E5E7EB;
                border-radius: 3px;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                background: #3B82F6;
                transition: width 0.3s;
            }
            .progress-fill.general {
                background: #10B981;
            }
        </style>
    `;

    // Show participants tab by default
    switchTab('participants');
}

function switchTab(tabName) {
    // Prevent switching if modal is open or processing
    if (window.leaderState.isModalOpen || window.leaderState.isProcessing) {
        return;
    }

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    if (tabName === 'participants') {
        renderParticipants();
    } else {
        renderCompetitions();
    }
}

async function renderParticipants() {
    const container = document.getElementById('leaderContent');
    const { participants, categories } = window.leaderState;

    // Get registration counts for progress tracking
    const participantIds = participants.map(p => p.id);
    if (participantIds.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-gray-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
                <p class="text-gray-500">No participants added yet</p>
                <p class="text-sm text-gray-400 mt-2">Contact admin to add participants</p>
            </div>
        `;
        return;
    }

    const { data: registrations } = await supabase
        .from('participant_competitions')
        .select('*, competitions(is_stage_item, categories(is_general))')
        .in('participant_id', participantIds);

    // Calculate registration counts (excluding general category competitions)
    const regCounts = {};
    participants.forEach(p => {
        const pRegs = registrations?.filter(r => r.participant_id === p.id) || [];
        const nonGeneralRegs = pRegs.filter(r => !r.competitions?.categories?.is_general);
        regCounts[p.id] = {
            stage: nonGeneralRegs.filter(r => r.competitions?.is_stage_item).length,
            nonStage: nonGeneralRegs.filter(r => !r.competitions?.is_stage_item).length,
            total: pRegs.length,
            general: pRegs.filter(r => r.competitions?.categories?.is_general).length
        };
    });

    // Group participants by category
    const participantsByCategory = {};
    participants.forEach(p => {
        const catId = p.category_id;
        if (!participantsByCategory[catId]) participantsByCategory[catId] = [];
        participantsByCategory[catId].push(p);
    });

    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Team Participants</h2>
            
            <!-- Category Filter -->
            <div class="mb-4">
                <div class="flex flex-wrap -m-1">
                    <span class="filter-chip active" onclick="filterParticipants('all')" id="filter-all">
                        All (${participants.length})
                    </span>
                    ${categories.filter(c => participants.some(p => p.category_id === c.id))
                        .map(cat => `
                            <span class="filter-chip" onclick="filterParticipants(${cat.id})" id="filter-${cat.id}">
                                ${cat.name} (${participantsByCategory[cat.id]?.length || 0})
                            </span>
                        `).join('')}
                </div>
            </div>

            <!-- Participants List -->
            <div id="participantsList">
                ${participants.map(p => {
                    const category = categories.find(c => c.id === p.category_id);
                    const counts = regCounts[p.id] || { stage: 0, nonStage: 0, total: 0, general: 0 };
                    const isGeneral = category?.is_general;
                    const stageProgress = (counts.stage / window.leaderState.maxStage) * 100;
                    const nonStageProgress = (counts.nonStage / window.leaderState.maxNonStage) * 100;
                    
                    return `
                        <div class="card participant-card ${isGeneral ? 'border-l-4 border-green-500' : ''}" data-category="${p.category_id}" onclick="showParticipantDetails(${p.id})">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-900">${p.name}</h3>
                                    <p class="text-sm text-gray-500">${category?.name || 'Unknown'} ${isGeneral ? '(General)' : ''}</p>
                                </div>
                                <div class="text-right">
                                    <span class="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        ${p.chest_number || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            
                            <!-- Registration Progress -->
                            <div class="space-y-2">
                                ${isGeneral ? `
                                    <div>
                                        <div class="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>General Competitions</span>
                                            <span>${counts.general} registered</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill general" style="width: 100%"></div>
                                        </div>
                                    </div>
                                ` : `
                                    <div>
                                        <div class="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Stage Items</span>
                                            <span>${counts.stage}/${window.leaderState.maxStage}</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${Math.min(stageProgress, 100)}%"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Non-Stage Items</span>
                                            <span>${counts.nonStage}/${window.leaderState.maxNonStage}</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${Math.min(nonStageProgress, 100)}%"></div>
                                        </div>
                                    </div>
                                `}
                                <div class="text-xs text-gray-500 mt-1">
                                    Total competitions: ${counts.total}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

async function showParticipantDetails(participantId) {
    if (window.leaderState.isModalOpen) return;
    window.leaderState.isModalOpen = true;

    const { participants, categories } = window.leaderState;
    const participant = participants.find(p => p.id === participantId);
    const category = categories.find(c => c.id === participant.category_id);

    // Get participant's competitions
    const { data: registrations } = await supabase
        .from('participant_competitions')
        .select('*, competitions(*, categories(name))')
        .eq('participant_id', participantId);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 mb-1">${participant.name}</h3>
                        <p class="text-sm text-gray-500">${category?.name || 'Unknown'} ${category?.is_general ? '(General)' : ''}</p>
                        <p class="text-xs text-gray-400 mt-1">Chest #${participant.chest_number}</p>
                    </div>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-3">Registered Competitions (${registrations?.length || 0})</h4>
                    
                    ${!registrations || registrations.length === 0 ? `
                        <div class="text-center py-6">
                            <div class="text-gray-400 mb-2">
                                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <p class="text-gray-500">No competitions registered</p>
                        </div>
                    ` : `
                        <div class="space-y-3 max-h-60 overflow-y-auto">
                            ${registrations.map(reg => `
                                <div class="border rounded-lg p-3">
                                    <div class="flex items-start justify-between">
                                        <div class="flex-1">
                                            <h5 class="font-medium text-gray-900">${reg.competitions.name}</h5>
                                            <p class="text-sm text-gray-500">${reg.competitions.categories?.name}</p>
                                            <div class="flex items-center gap-2 mt-2">
                                                <span class="px-2 py-1 text-xs rounded ${reg.competitions.is_stage_item ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                                    ${reg.competitions.is_stage_item ? 'Stage' : 'Non-Stage'}
                                                </span>
                                                <span class="px-2 py-1 text-xs rounded ${reg.competitions.is_group_item ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                                                    ${reg.competitions.is_group_item ? 'Group' : 'Individual'}
                                                </span>
                                                ${reg.competitions.categories?.is_general ? 
                                                    '<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800">General</span>' : ''}
                                            </div>
                                        </div>
                                        ${reg.code_letter ? `
                                            <span class="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                ${reg.code_letter}
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                
                <button onclick="closeModal()" class="w-full btn btn-secondary">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function filterParticipants(categoryId) {
    // Update active filter
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
    document.getElementById(`filter-${categoryId}`).classList.add('active');

    // Show/hide participants
    const cards = document.querySelectorAll('.participant-card');
    cards.forEach(card => {
        if (categoryId === 'all' || card.dataset.category == categoryId) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

async function renderCompetitions() {
    const container = document.getElementById('leaderContent');
    const { competitions, categories, participants } = window.leaderState;

    // Get all registrations for this team
    const participantIds = participants.map(p => p.id);
    const { data: registrations } = await supabase
        .from('participant_competitions')
        .select('*, participants(*), competitions(*)')
        .in('participant_id', participantIds);

    // Filter competitions - show general category competitions to all, others only to matching category participants
    const availableCompetitions = competitions.filter(comp => {
        const compCategory = categories.find(c => c.id === comp.category_id);
        if (compCategory?.is_general) return true; // General category competitions available to all
        return participants.some(p => p.category_id === comp.category_id); // Regular competitions only for matching categories
    });

    // Group competitions by category
    const competitionsByCategory = {};
    availableCompetitions.forEach(comp => {
        const catId = comp.category_id;
        if (!competitionsByCategory[catId]) competitionsByCategory[catId] = [];
        competitionsByCategory[catId].push(comp);
    });

    // Get registration counts per competition
    const regCounts = {};
    availableCompetitions.forEach(comp => {
        const compRegs = registrations?.filter(r => r.competition_id === comp.id) || [];
        regCounts[comp.id] = {
            registered: compRegs.length,
            participants: compRegs.map(r => r.participants)
        };
    });

    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Competitions</h2>
            
            <!-- Category Filter -->
            <div class="mb-4">
                <div class="flex flex-wrap -m-1">
                    <span class="filter-chip active" onclick="filterCompetitions('all')" id="comp-filter-all">
                        All (${availableCompetitions.length})
                    </span>
                    ${categories.filter(c => availableCompetitions.some(comp => comp.category_id === c.id))
                        .map(cat => `
                            <span class="filter-chip" onclick="filterCompetitions(${cat.id})" id="comp-filter-${cat.id}">
                                ${cat.name} (${competitionsByCategory[cat.id]?.length || 0})
                            </span>
                        `).join('')}
                </div>
            </div>

            <!-- Competitions List -->
            <div id="competitionsList">
                ${availableCompetitions.length === 0 ? `
                    <div class="text-center py-12">
                        <div class="text-gray-400 mb-4">
                            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <p class="text-gray-500">No competitions available</p>
                        <p class="text-sm text-gray-400 mt-2">Competitions will appear here when added by admin</p>
                    </div>
                ` : availableCompetitions.map(comp => {
                    const category = categories.find(c => c.id === comp.category_id);
                    const counts = regCounts[comp.id];
                    const isRegistered = counts.registered > 0;
                    const maxParticipants = comp.max_participants_per_team;
                    const isFull = maxParticipants && counts.registered >= maxParticipants;

                    let statusClass = 'bg-blue-100 text-blue-800';
                    let statusText = 'Available';

                    if (isRegistered) {
                        statusClass = 'bg-green-100 text-green-800';
                        statusText = `Registered (${counts.registered})`;
                    }
                    if (isFull) {
                        statusClass = 'bg-red-100 text-red-800';
                        statusText = 'Full';
                    }

                    return `
                        <div class="card competition-card" data-category="${comp.category_id}" onclick="openCompetitionDetails(${comp.id})">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-900 mb-1">${comp.name}</h3>
                                    <p class="text-sm text-gray-500">${category?.name || 'Unknown'}</p>
                                    <div class="flex items-center gap-2 mt-2">
                                        <span class="px-2 py-1 text-xs rounded ${comp.is_stage_item ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                            ${comp.is_stage_item ? 'Stage' : 'Non-Stage'}
                                        </span>
                                        <span class="px-2 py-1 text-xs rounded ${comp.is_group_item ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                                            ${comp.is_group_item ? 'Group' : 'Individual'}
                                        </span>
                                        ${category?.is_general ? '<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800">General</span>' : ''}
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="px-2 py-1 text-xs rounded ${statusClass}">${statusText}</span>
                                    ${maxParticipants ? `<p class="text-xs text-gray-500 mt-1">Max: ${maxParticipants}</p>` : ''}
                                </div>
                            </div>
                            
                            ${isRegistered ? `
                                <div class="mt-3 pt-3 border-t">
                                    <p class="text-xs text-gray-600 mb-2">Registered participants:</p>
                                    <div class="flex flex-wrap gap-1">
                                        ${counts.participants.map(p => `
                                            <span class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                ${p.name}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function filterCompetitions(categoryId) {
    // Update active filter
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
    document.getElementById(`comp-filter-${categoryId}`).classList.add('active');

    // Show/hide competitions
    const cards = document.querySelectorAll('.competition-card');
    cards.forEach(card => {
        if (categoryId === 'all' || card.dataset.category == categoryId) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

async function openCompetitionDetails(competitionId) {
    if (window.leaderState.isModalOpen || window.leaderState.isProcessing) return;
    
    window.leaderState.isModalOpen = true;
    window.leaderState.isProcessing = true;

    const { competitions, participants, categories, maxStage, maxNonStage } = window.leaderState;
    const competition = competitions.find(c => c.id === competitionId);
    const category = categories.find(c => c.id === competition.category_id);

    // For general category, show all participants. For others, show only category participants
    const availableParticipants = category?.is_general 
        ? participants 
        : participants.filter(p => p.category_id === competition.category_id);

    if (availableParticipants.length === 0) {
        showNotification('No participants available for this category', 'error');
        window.leaderState.isModalOpen = false;
        window.leaderState.isProcessing = false;
        return;
    }

    // Get current registrations
    const { data: currentRegistrations } = await supabase
        .from('participant_competitions')
        .select('participant_id, participants(*)')
        .eq('competition_id', competitionId)
        .in('participant_id', availableParticipants.map(p => p.id));

    const registeredIds = currentRegistrations?.map(r => r.participant_id) || [];

    // Get registration counts for each participant (excluding general category competitions)
    const { data: allRegistrations } = await supabase
        .from('participant_competitions')
        .select('participant_id, competitions(is_stage_item, categories(is_general))')
        .in('participant_id', availableParticipants.map(p => p.id));

    const regCounts = {};
    availableParticipants.forEach(p => {
        const pRegs = allRegistrations?.filter(r => r.participant_id === p.id) || [];
        // Only count non-general category competitions for limits
        const nonGeneralRegs = pRegs.filter(r => !r.competitions?.categories?.is_general);
        regCounts[p.id] = {
            stage: nonGeneralRegs.filter(r => r.competitions?.is_stage_item).length,
            nonStage: nonGeneralRegs.filter(r => !r.competitions?.is_stage_item).length
        };
    });

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 mb-1">${competition.name}</h3>
                        <p class="text-sm text-gray-500">${category.name}</p>
                    </div>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="flex items-center gap-2 mb-4">
                    <span class="px-2 py-1 text-xs rounded ${competition.is_stage_item ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${competition.is_stage_item ? 'Stage Item' : 'Non-Stage Item'}
                    </span>
                    <span class="px-2 py-1 text-xs rounded ${competition.is_group_item ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                        ${competition.is_group_item ? 'Group Item' : 'Individual Item'}
                    </span>
                    ${category?.is_general ? '<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800">General Category</span>' : ''}
                </div>
                
                ${competition.max_participants_per_team ? `
                    <div class="bg-blue-50 p-3 rounded-lg mb-4">
                        <p class="text-sm text-blue-800">
                            <strong>Team Limit:</strong> ${registeredIds.length}/${competition.max_participants_per_team} participants
                        </p>
                    </div>
                ` : ''}
                
                ${competition.is_group_item ? `
                    <div class="bg-purple-50 p-3 rounded-lg mb-4">
                        <p class="text-sm text-purple-800">
                            <strong>Group Item:</strong> Only one participant per team allowed
                        </p>
                    </div>
                ` : ''}
                
                ${category?.is_general ? `
                    <div class="bg-green-50 p-3 rounded-lg mb-4">
                        <p class="text-sm text-green-800">
                            <strong>General Category:</strong> All participants can compete, no registration limits apply
                        </p>
                    </div>
                ` : ''}
                
                <h4 class="font-semibold mb-3">Select Participants</h4>
                
                <form id="registrationForm">
                    <div class="space-y-2 mb-6 max-h-60 overflow-y-auto">
                        ${availableParticipants.map(p => {
                            const isRegistered = registeredIds.includes(p.id);
                            const counts = regCounts[p.id];
                            const participantCategory = categories.find(c => c.id === p.category_id);
                            
                            // Check limits only for non-general categories
                            let maxReached = false;
                            if (!category?.is_general) {
                                maxReached = competition.is_stage_item 
                                    ? counts.stage >= maxStage 
                                    : counts.nonStage >= maxNonStage;
                            }
                            
                            return `
                                <label class="flex items-center p-3 rounded-lg border hover:bg-gray-50 ${isRegistered ? 'border-green-200 bg-green-50' : 'border-gray-200'}">
                                    <input type="checkbox" 
                                           name="participants" 
                                           value="${p.id}" 
                                           ${isRegistered ? 'checked' : ''}
                                           ${maxReached && !isRegistered ? 'disabled' : ''}
                                           class="mr-3 w-5 h-5">
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-900">${p.name}</div>
                                        <div class="text-xs text-gray-500">
                                            ${participantCategory?.name} | 
                                            ${category?.is_general 
                                                ? 'No limits (General)' 
                                                : `Stage: ${counts.stage}/${maxStage} | Non-Stage: ${counts.nonStage}/${maxNonStage}`
                                            }
                                        </div>
                                        ${maxReached && !category?.is_general ? '<div class="text-xs text-red-500">Registration limit reached</div>' : ''}
                                    </div>
                                    <span class="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        ${p.chest_number}
                                    </span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="button" onclick="closeModal()" class="flex-1 btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" class="flex-1 btn btn-primary" id="updateButton">
                            Update Registration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add validation for checkbox selection
    const checkboxes = modal.querySelectorAll('input[name="participants"]');
    const updateButton = modal.querySelector('#updateButton');

    function validateSelection() {
        if (window.leaderState.isProcessing) return;

        const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

        // For group items, only allow one participant
        if (competition.is_group_item && selectedCount > 1) {
            const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);
            checkedBoxes.slice(0, -1).forEach(cb => cb.checked = false);
            showNotification('Only one participant allowed for group items', 'error');
        }

        // Check team limit
        if (competition.max_participants_per_team) {
            const currentSelected = Array.from(checkboxes).filter(cb => cb.checked).length;
            if (currentSelected > competition.max_participants_per_team) {
                const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);
                checkedBoxes[checkedBoxes.length - 1].checked = false;
                showNotification(`Maximum ${competition.max_participants_per_team} participants allowed`, 'error');
            }
        }
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', validateSelection);
    });

    // Handle form submission
    document.getElementById('registrationForm').onsubmit = async (e) => {
        e.preventDefault();
        if (window.leaderState.isProcessing) return;
        
        updateButton.disabled = true;
        updateButton.textContent = 'Updating...';
        
        await updateCompetitionRegistration(competitionId);
    };

    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    window.leaderState.isProcessing = false;
}

async function updateCompetitionRegistration(competitionId) {
    window.leaderState.isProcessing = true;

    const form = document.getElementById('registrationForm');
    const selectedIds = Array.from(form.querySelectorAll('input[name="participants"]:checked'))
        .map(input => parseInt(input.value));

    try {
        // Get current registrations
        const { data: currentRegs } = await supabase
            .from('participant_competitions')
            .select('participant_id')
            .eq('competition_id', competitionId);

        const currentIds = currentRegs?.map(r => r.participant_id) || [];

        // Find additions and removals
        const toAdd = selectedIds.filter(id => !currentIds.includes(id));
        const toRemove = currentIds.filter(id => !selectedIds.includes(id));

        // Remove registrations first
        if (toRemove.length > 0) {
            const { error: removeError } = await supabase
                .from('participant_competitions')
                .delete()
                .eq('competition_id', competitionId)
                .in('participant_id', toRemove);

            if (removeError) throw removeError;

            // Update participant registration counts using direct SQL updates
            for (const participantId of toRemove) {
                const { data: comp } = await supabase
                    .from('competitions')
                    .select('is_stage_item, categories(is_general)')
                    .eq('id', competitionId)
                    .single();

                if (!comp.categories.is_general) {
                    const field = comp.is_stage_item ? 'stage_registrations' : 'non_stage_registrations';
                    
                    // Use RPC function instead of supabase.raw
                    await supabase.rpc('update_participant_count', {
                        participant_id: participantId,
                        field_name: field,
                        increment: -1
                    });
                }
            }
        }

        // Add new registrations
        if (toAdd.length > 0) {
            const { error: addError } = await supabase
                .from('participant_competitions')
                .insert(toAdd.map(id => ({
                    participant_id: id,
                    competition_id: competitionId
                })));

            if (addError) throw addError;

            // Update participant registration counts
            for (const participantId of toAdd) {
                const { data: comp } = await supabase
                    .from('competitions')
                    .select('is_stage_item, categories(is_general)')
                    .eq('id', competitionId)
                    .single();

                if (!comp.categories.is_general) {
                    const field = comp.is_stage_item ? 'stage_registrations' : 'non_stage_registrations';
                    
                    // Use RPC function instead of supabase.raw
                    await supabase.rpc('update_participant_count', {
                        participant_id: participantId,  
                        field_name: field,
                        increment: 1
                    });
                }
            }
        }

        showNotification('Registration updated successfully');
        closeModal();

        // Refresh competitions view
        renderCompetitions();

    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Failed to update registration: ' + error.message, 'error');
    } finally {
        window.leaderState.isProcessing = false;
    }
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
        window.leaderState.isModalOpen = false;
        window.leaderState.isProcessing = false;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// Show notification function
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white max-w-md shadow-lg`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200 font-bold">
                ×
            </button>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
}

// Global function assignments
window.loadTeamLeaderContent = loadTeamLeaderContent;
window.switchTab = switchTab;
window.filterParticipants = filterParticipants;
window.filterCompetitions = filterCompetitions;
window.showParticipantDetails = showParticipantDetails;
window.openCompetitionDetails = openCompetitionDetails;
window.updateCompetitionRegistration = updateCompetitionRegistration;
window.closeModal = closeModal;
window.logout = logout;
