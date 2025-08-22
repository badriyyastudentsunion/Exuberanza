// judge.js - Judge Dashboard and Competition Scoring

// Global state management
window.judgeState = {
    isModalOpen: false,
    isProcessing: false,
    competitions: [],
    participants: [],
    results: [],
    judgeId: null,
    currentCompetition: null
};

async function loadJudgeContent(content, user) {
    try {
        // Fetch judge's assigned competitions
        const [assignedComps, allResults] = await Promise.all([
            supabase
                .from('competition_judges')
                .select('*, competitions(*, categories(name)), judges(name)')
                .eq('judge_id', user.id),
            supabase
                .from('results')
                .select('*, competitions(name), participants(name, chest_number)')
                .eq('judge_id', user.id)
        ]);

        const competitions = assignedComps.data || [];
        const results = allResults.data || [];

        // Update global state
        window.judgeState = {
            ...window.judgeState,
            competitions,
            results,
            judgeId: user.id
        };

        renderJudgeDashboard(content, user);
    } catch (error) {
        console.error('Error loading judge content:', error);
        content.innerHTML = `<div class="bg-red-50 p-4 rounded">Error loading data: ${error.message}</div>`;
    }
}

function renderJudgeDashboard(content, user) {
    content.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 sticky top-0 z-50">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-xl font-bold">${user.name}</h1>
                        <p class="text-purple-100 text-sm">Judge Panel</p>
                    </div>
                    <button onclick="logout()" class="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
                        Logout
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="bg-white border-b sticky top-16 z-40">
                <div class="flex">
                    <button class="tab-btn active flex-1 py-4 px-4 font-medium text-center" id="tab-competitions" onclick="switchJudgeTab('competitions')">
                        <span class="block">My Competitions</span>
                        <span class="text-xs text-gray-500">${window.judgeState.competitions.length}</span>
                    </button>
                    <button class="tab-btn flex-1 py-4 px-4 font-medium text-center" id="tab-results" onclick="switchJudgeTab('results')">
                        <span class="block">My Results</span>
                        <span class="text-xs text-gray-500">${window.judgeState.results.length}</span>
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div id="judgeContent" class="p-4 pb-20">
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
                color: #7C3AED;
                border-bottom-color: #7C3AED;
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
                background: #7C3AED;
                color: white;
            }
            .btn-primary:hover:not(:disabled) {
                background: #6D28D9;
            }
            .btn-secondary {
                background: #F3F4F6;
                color: #374151;
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
            .score-input {
                width: 100px;
                padding: 8px;
                border: 2px solid #E5E7EB;
                border-radius: 6px;
                text-align: center;
                font-weight: bold;
            }
            .score-input:focus {
                border-color: #7C3AED;
                outline: none;
            }
            .grade-btn {
                padding: 8px 16px;
                margin: 4px;
                border: 2px solid #E5E7EB;
                border-radius: 20px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
            }
            .grade-btn.active {
                background: #7C3AED;
                color: white;
                border-color: #7C3AED;
            }
        </style>
    `;

    // Show competitions tab by default
    switchJudgeTab('competitions');
}

function switchJudgeTab(tabName) {
    if (window.judgeState.isModalOpen || window.judgeState.isProcessing) {
        return;
    }

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    if (tabName === 'competitions') {
        renderJudgeCompetitions();
    } else {
        renderJudgeResults();
    }
}

async function renderJudgeCompetitions() {
    const container = document.getElementById('judgeContent');
    const { competitions } = window.judgeState;

    if (competitions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-gray-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <p class="text-gray-500">No competitions assigned</p>
                <p class="text-sm text-gray-400 mt-2">Contact admin to get competition assignments</p>
            </div>
        `;
        return;
    }

    // Get participants and results for each competition
    const competitionIds = competitions.map(c => c.competition_id);
    const [participants, results] = await Promise.all([
        supabase
            .from('participant_competitions')
            .select('*, participants(*, teams(name)), competitions(*)')
            .in('competition_id', competitionIds),
        supabase
            .from('results')
            .select('*')
            .eq('judge_id', window.judgeState.judgeId)
            .in('competition_id', competitionIds)
    ]);

    const allParticipants = participants.data || [];
    const allResults = results.data || [];

    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">My Assigned Competitions</h2>
            
            <div id="competitionsList">
                ${competitions.map(compAssignment => {
                    const competition = compAssignment.competitions;
                    const compParticipants = allParticipants.filter(p => p.competition_id === competition.id);
                    const compResults = allResults.filter(r => r.competition_id === competition.id);
                    
                    const judgedCount = compResults.length;
                    const totalCount = compParticipants.length;
                    const isComplete = judgedCount === totalCount && totalCount > 0;
                    
                    return `
                        <div class="card competition-card" onclick="openCompetitionScoring(${competition.id})">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-900 mb-1">${competition.name}</h3>
                                    <p class="text-sm text-gray-500">${competition.categories?.name}</p>
                                    <div class="flex items-center gap-2 mt-2">
                                        <span class="px-2 py-1 text-xs rounded ${competition.is_stage_item ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                            ${competition.is_stage_item ? 'Stage' : 'Non-Stage'}
                                        </span>
                                        <span class="px-2 py-1 text-xs rounded ${competition.is_group_item ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                                            ${competition.is_group_item ? 'Group' : 'Individual'}
                                        </span>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="px-2 py-1 text-xs rounded ${isComplete ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                                        ${isComplete ? 'Complete' : 'Pending'}
                                    </span>
                                    <p class="text-xs text-gray-500 mt-1">${judgedCount}/${totalCount} judged</p>
                                </div>
                            </div>
                            
                            <div class="mt-3 pt-3 border-t">
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-purple-600 h-2 rounded-full transition-all" style="width: ${totalCount > 0 ? (judgedCount/totalCount)*100 : 0}%"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

async function renderJudgeResults() {
    const container = document.getElementById('judgeContent');
    const { results } = window.judgeState;

    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">My Submitted Results</h2>
            
            ${results.length === 0 ? `
                <div class="text-center py-12">
                    <div class="text-gray-400 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-500">No results submitted yet</p>
                </div>
            ` : `
                <div id="resultsList">
                    ${results.map(result => `
                        <div class="card">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-900">${result.participants?.name}</h3>
                                    <p class="text-sm text-gray-500">${result.competitions?.name}</p>
                                    <p class="text-xs text-gray-400">Chest #${result.participants?.chest_number}</p>
                                </div>
                                <div class="text-right">
                                    <div class="text-lg font-bold text-purple-600">${result.points || 'N/A'}</div>
                                    <div class="text-sm text-gray-500">${result.grade || 'No Grade'}</div>
                                    <div class="text-xs text-gray-400">${new Date(result.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

async function openCompetitionScoring(competitionId) {
    if (window.judgeState.isModalOpen || window.judgeState.isProcessing) return;
    
    window.judgeState.isModalOpen = true;
    window.judgeState.currentCompetition = competitionId;

    try {
        // Get competition details and participants
        const [competition, participants, existingResults] = await Promise.all([
            supabase.from('competitions').select('*, categories(name)').eq('id', competitionId).single(),
            supabase
                .from('participant_competitions')
                .select('*, participants(*, teams(name))')
                .eq('competition_id', competitionId)
                .order('participants(name)'),
            supabase
                .from('results')
                .select('*')
                .eq('competition_id', competitionId)
                .eq('judge_id', window.judgeState.judgeId)
        ]);

        const comp = competition.data;
        const parts = participants.data || [];
        const results = existingResults.data || [];

        // Create results map for easy lookup
        const resultsMap = {};
        results.forEach(r => resultsMap[r.participant_id] = r);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 mb-1">${comp.name}</h3>
                            <p class="text-sm text-gray-500">${comp.categories?.name}</p>
                        </div>
                        <button onclick="closeJudgeModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <h4 class="font-semibold mb-3">Score Participants</h4>
                    
                    <div id="participantScoring" class="space-y-4 max-h-96 overflow-y-auto mb-6">
                        ${parts.map(p => {
                            const participant = p.participants;
                            const existingResult = resultsMap[participant.id];
                            
                            return `
                                <div class="border rounded-lg p-4" id="participant-${participant.id}">
                                    <div class="flex items-center justify-between mb-3">
                                        <div>
                                            <h5 class="font-medium text-gray-900">${participant.name}</h5>
                                            <p class="text-sm text-gray-500">${participant.teams?.name} • Chest #${participant.chest_number}</p>
                                        </div>
                                        <span class="px-2 py-1 text-xs rounded ${existingResult ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                            ${existingResult ? 'Scored' : 'Pending'}
                                        </span>
                                    </div>
                                    
                                    <!-- Points Input -->
                                    <div class="mb-3">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Points (0-100)</label>
                                        <input type="number" 
                                               min="0" 
                                               max="100" 
                                               step="0.01"
                                               value="${existingResult?.points || ''}"
                                               placeholder="Enter points"
                                               class="score-input"
                                               id="points-${participant.id}"
                                               onchange="updateGradeFromPoints(${participant.id})">
                                    </div>
                                    
                                    <!-- Grade Selection -->
                                    <div class="mb-3">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                                        <div class="flex flex-wrap" id="grades-${participant.id}">
                                            ${['A+', 'A', 'B', 'C'].map(grade => `
                                                <button type="button" 
                                                        class="grade-btn ${existingResult?.grade === grade ? 'active' : ''}"
                                                        onclick="selectGrade(${participant.id}, '${grade}')"
                                                        id="grade-${participant.id}-${grade}">
                                                    ${grade}
                                                </button>
                                            `).join('')}
                                        </div>
                                    </div>
                                    
                                    <!-- Position Input (Optional) -->
                                    <div class="mb-3">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Position (Optional)</label>
                                        <select class="w-full p-2 border rounded" id="position-${participant.id}">
                                            <option value="">Select Position</option>
                                            <option value="1" ${existingResult?.position === 1 ? 'selected' : ''}>1st Place</option>
                                            <option value="2" ${existingResult?.position === 2 ? 'selected' : ''}>2nd Place</option>
                                            <option value="3" ${existingResult?.position === 3 ? 'selected' : ''}>3rd Place</option>
                                        </select>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="button" onclick="closeJudgeModal()" class="flex-1 btn btn-secondary">
                            Cancel
                        </button>
                        <button type="button" onclick="submitAllScores()" class="flex-1 btn btn-primary" id="submitButton">
                            Submit Scores
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeJudgeModal();
        });

    } catch (error) {
        console.error('Error opening competition scoring:', error);
        showNotification('Failed to load competition details', 'error');
        window.judgeState.isModalOpen = false;
    }
}

function selectGrade(participantId, grade) {
    // Clear all grade selections for this participant
    document.querySelectorAll(`#grades-${participantId} .grade-btn`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mark selected grade as active
    document.getElementById(`grade-${participantId}-${grade}`).classList.add('active');
    
    // Update points based on grade
    const pointsInput = document.getElementById(`points-${participantId}`);
    const gradePoints = { 'A+': 95, 'A': 80, 'B': 65, 'C': 55 };
    if (!pointsInput.value) {
        pointsInput.value = gradePoints[grade];
    }
}

function updateGradeFromPoints(participantId) {
    const pointsInput = document.getElementById(`points-${participantId}`);
    const points = parseFloat(pointsInput.value);
    
    if (isNaN(points)) return;
    
    let grade = '';
    if (points >= 90) grade = 'A+';
    else if (points >= 70) grade = 'A';
    else if (points >= 60) grade = 'B';
    else if (points >= 50) grade = 'C';
    
    if (grade) {
        // Clear all grades
        document.querySelectorAll(`#grades-${participantId} .grade-btn`).forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Set appropriate grade
        const gradeBtn = document.getElementById(`grade-${participantId}-${grade}`);
        if (gradeBtn) gradeBtn.classList.add('active');
    }
}

async function submitAllScores() {
    if (window.judgeState.isProcessing) return;
    
    window.judgeState.isProcessing = true;
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const competitionId = window.judgeState.currentCompetition;
        const participants = document.querySelectorAll('#participantScoring > div');
        
        const scores = [];
        let hasError = false;

        participants.forEach(div => {
            const participantId = div.id.replace('participant-', '');
            const points = document.getElementById(`points-${participantId}`).value;
            const position = document.getElementById(`position-${participantId}`).value;
            
            // Get selected grade
            const activeGrade = div.querySelector('.grade-btn.active');
            const grade = activeGrade ? activeGrade.textContent : '';

            if (points && grade) {
                scores.push({
                    competition_id: competitionId,
                    participant_id: parseInt(participantId),
                    judge_id: window.judgeState.judgeId,
                    points: parseFloat(points),
                    grade: grade,
                    position: position ? parseInt(position) : null,
                    status: 'pending'
                });
            }
        });

        if (scores.length === 0) {
            showNotification('Please score at least one participant', 'error');
            return;
        }

        // Delete existing results for this competition and judge
        await supabase
            .from('results')
            .delete()
            .eq('competition_id', competitionId)
            .eq('judge_id', window.judgeState.judgeId);

        // Insert new results
        const { error } = await supabase
            .from('results')
            .insert(scores);

        if (error) throw error;

        showNotification(`Successfully submitted ${scores.length} scores`);
        closeJudgeModal();
        
        // Refresh the competitions view
        await refreshJudgeData();
        switchJudgeTab('competitions');

    } catch (error) {
        console.error('Error submitting scores:', error);
        showNotification('Failed to submit scores: ' + error.message, 'error');
    } finally {
        window.judgeState.isProcessing = false;
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Scores';
    }
}

async function refreshJudgeData() {
    try {
        const [assignedComps, allResults] = await Promise.all([
            supabase
                .from('competition_judges')
                .select('*, competitions(*, categories(name)), judges(name)')
                .eq('judge_id', window.judgeState.judgeId),
            supabase
                .from('results')
                .select('*, competitions(name), participants(name, chest_number)')
                .eq('judge_id', window.judgeState.judgeId)
        ]);

        window.judgeState.competitions = assignedComps.data || [];
        window.judgeState.results = allResults.data || [];

        // Update tab counts
        const compTab = document.getElementById('tab-competitions');
        const resultsTab = document.getElementById('tab-results');
        
        if (compTab) {
            compTab.querySelector('.text-xs').textContent = window.judgeState.competitions.length;
        }
        if (resultsTab) {
            resultsTab.querySelector('.text-xs').textContent = window.judgeState.results.length;
        }

    } catch (error) {
        console.error('Error refreshing judge data:', error);
    }
}

function closeJudgeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
        window.judgeState.isModalOpen = false;
        window.judgeState.isProcessing = false;
        window.judgeState.currentCompetition = null;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// Show notification function
function showNotification(message, type = 'success') {
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
window.loadJudgeContent = loadJudgeContent;
window.switchJudgeTab = switchJudgeTab;
window.openCompetitionScoring = openCompetitionScoring;
window.selectGrade = selectGrade;
window.updateGradeFromPoints = updateGradeFromPoints;
window.submitAllScores = submitAllScores;
window.closeJudgeModal = closeJudgeModal;
window.logout = logout;
