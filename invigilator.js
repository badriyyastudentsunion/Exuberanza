// invigilator.js - Invigilator Dashboard and Competition Monitoring

// Global state management
window.invigilatorState = {
    isModalOpen: false,
    isProcessing: false,
    competitions: [],
    assignments: [],
    reports: [],
    invigilatorId: null
};

async function loadInvigilatorContent(content, user) {
    try {
        // Fetch invigilator's assigned competitions
        const [assignedComps, reports] = await Promise.all([
            supabase
                .from('competition_invigilators')
                .select('*, competitions(*, categories(name)), invigilators(name)')
                .eq('invigilator_id', user.id),
            supabase
                .from('participant_competitions')
                .select('*, competitions(name, categories(name)), participants(name, chest_number, teams(name))')
                .eq('is_reported', true)
        ]);

        const assignments = assignedComps.data || [];
        const allReports = reports.data || [];

        // Update global state
        window.invigilatorState = {
            ...window.invigilatorState,
            assignments,
            reports: allReports,
            invigilatorId: user.id
        };

        renderInvigilatorDashboard(content, user);
    } catch (error) {
        console.error('Error loading invigilator content:', error);
        content.innerHTML = `<div class="bg-red-50 p-4 rounded">Error loading data: ${error.message}</div>`;
    }
}

function renderInvigilatorDashboard(content, user) {
    content.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sticky top-0 z-50">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-xl font-bold">${user.name}</h1>
                        <p class="text-green-100 text-sm">Invigilator Panel</p>
                    </div>
                    <button onclick="logout()" class="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
                        Logout
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="bg-white border-b sticky top-16 z-40">
                <div class="flex">
                    <button class="tab-btn active flex-1 py-4 px-4 font-medium text-center" id="tab-assignments" onclick="switchInvigilatorTab('assignments')">
                        <span class="block">My Duties</span>
                        <span class="text-xs text-gray-500">${window.invigilatorState.assignments.length}</span>
                    </button>
                    <button class="tab-btn flex-1 py-4 px-4 font-medium text-center" id="tab-monitor" onclick="switchInvigilatorTab('monitor')">
                        <span class="block">Monitor</span>
                        <span class="text-xs text-gray-500">Live</span>
                    </button>
                    <button class="tab-btn flex-1 py-4 px-4 font-medium text-center" id="tab-reports" onclick="switchInvigilatorTab('reports')">
                        <span class="block">Reports</span>
                        <span class="text-xs text-gray-500">${window.invigilatorState.reports.length}</span>
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div id="invigilatorContent" class="p-4 pb-20">
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
                color: #059669;
                border-bottom-color: #059669;
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
                background: #059669;
                color: white;
            }
            .btn-primary:hover:not(:disabled) {
                background: #047857;
            }
            .btn-danger {
                background: #DC2626;
                color: white;
            }
            .btn-danger:hover:not(:disabled) {
                background: #B91C1C;
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
            .status-indicator {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 8px;
            }
            .status-active {
                background: #10B981;
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
            }
            .status-pending {
                background: #F59E0B;
            }
            .status-completed {
                background: #6B7280;
            }
            .participant-row {
                padding: 12px;
                border: 1px solid #E5E7EB;
                border-radius: 8px;
                margin-bottom: 8px;
                display: flex;
                justify-content: between;
                align-items: center;
            }
            .participant-row.reported {
                background: #FEF2F2;
                border-color: #FECACA;
            }
        </style>
    `;

    // Show assignments tab by default
    switchInvigilatorTab('assignments');
}

function switchInvigilatorTab(tabName) {
    if (window.invigilatorState.isModalOpen || window.invigilatorState.isProcessing) {
        return;
    }

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    if (tabName === 'assignments') {
        renderInvigilatorAssignments();
    } else if (tabName === 'monitor') {
        renderInvigilatorMonitor();
    } else {
        renderInvigilatorReports();
    }
}

async function renderInvigilatorAssignments() {
    const container = document.getElementById('invigilatorContent');
    const { assignments } = window.invigilatorState;

    if (assignments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-gray-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                </div>
                <p class="text-gray-500">No invigilation duties assigned</p>
                <p class="text-sm text-gray-400 mt-2">Contact admin to get competition assignments</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">My Invigilation Duties</h2>
            
            <div id="assignmentsList">
                ${assignments.map(assignment => {
                    const competition = assignment.competitions;
                    const now = new Date();
                    const scheduledTime = competition.scheduled_at ? new Date(competition.scheduled_at) : null;
                    
                    let status = 'pending';
                    let statusText = 'Scheduled';
                    
                    if (scheduledTime) {
                        const timeDiff = scheduledTime - now;
                        if (timeDiff < -3600000) { // 1 hour past
                            status = 'completed';
                            statusText = 'Completed';
                        } else if (timeDiff < 0) { // Started but not completed
                            status = 'active';
                            statusText = 'Active';
                        } else if (timeDiff < 3600000) { // Within 1 hour
                            status = 'starting';
                            statusText = 'Starting Soon';
                        }
                    }
                    
                    return `
                        <div class="card assignment-card" onclick="viewCompetitionDetails(${competition.id})">
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
                                    <div class="flex items-center mb-1">
                                        <span class="status-indicator status-${status}"></span>
                                        <span class="text-sm font-medium">${statusText}</span>
                                    </div>
                                    ${scheduledTime ? `
                                        <div class="text-xs text-gray-500">
                                            ${scheduledTime.toLocaleDateString()}
                                        </div>
                                        <div class="text-xs text-gray-500">
                                            ${scheduledTime.toLocaleTimeString()}
                                        </div>
                                    ` : '<div class="text-xs text-gray-500">Not scheduled</div>'}
                                </div>
                            </div>
                            
                            <div class="mt-3 pt-3 border-t">
                                <div class="text-xs text-gray-600">
                                    Tap to view participants and monitor competition
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

async function renderInvigilatorMonitor() {
    const container = document.getElementById('invigilatorContent');
    
    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Live Competition Monitor</h2>
            
            <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
                <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onclick="markAttendance()" class="btn btn-primary">
                        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Mark Attendance
                    </button>
                    <button onclick="reportIssue()" class="btn btn-danger">
                        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        Report Issue
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold mb-4">Current Status</h3>
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-green-600" id="activeCount">0</div>
                        <div class="text-sm text-gray-600">Active Competitions</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600" id="participantCount">0</div>
                        <div class="text-sm text-gray-600">Total Participants</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Update counts
    updateMonitorCounts();
}

async function updateMonitorCounts() {
    try {
        const { assignments } = window.invigilatorState;
        const now = new Date();
        
        let activeCount = 0;
        let totalParticipants = 0;

        for (const assignment of assignments) {
            const competition = assignment.competitions;
            const scheduledTime = competition.scheduled_at ? new Date(competition.scheduled_at) : null;
            
            if (scheduledTime) {
                const timeDiff = scheduledTime - now;
                if (timeDiff < 0 && timeDiff > -3600000) { // Active (started but not completed)
                    activeCount++;
                    
                    // Get participant count
                    const { data: participants } = await supabase
                        .from('participant_competitions')
                        .select('id')
                        .eq('competition_id', competition.id);
                    
                    totalParticipants += participants?.length || 0;
                }
            }
        }

        document.getElementById('activeCount').textContent = activeCount;
        document.getElementById('participantCount').textContent = totalParticipants;
    } catch (error) {
        console.error('Error updating monitor counts:', error);
    }
}

async function renderInvigilatorReports() {
    const container = document.getElementById('invigilatorContent');
    const { reports } = window.invigilatorState;

    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Competition Reports</h2>
            
            ${reports.length === 0 ? `
                <div class="text-center py-12">
                    <div class="text-gray-400 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-500">No reports submitted</p>
                    <p class="text-sm text-gray-400 mt-2">Reports will appear here when participants are marked</p>
                </div>
            ` : `
                <div id="reportsList">
                    ${reports.map(report => `
                        <div class="card">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-900">${report.participants?.name}</h3>
                                    <p class="text-sm text-gray-500">${report.competitions?.name}</p>
                                    <p class="text-xs text-gray-400">
                                        ${report.participants?.teams?.name} • Chest #${report.participants?.chest_number}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <span class="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                                        Reported
                                    </span>
                                    <div class="text-xs text-gray-500 mt-1">
                                        ${new Date(report.reported_at || report.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

async function viewCompetitionDetails(competitionId) {
    if (window.invigilatorState.isModalOpen) return;
    
    window.invigilatorState.isModalOpen = true;

    try {
        // Get competition details and participants
        const [competition, participants] = await Promise.all([
            supabase.from('competitions').select('*, categories(name)').eq('id', competitionId).single(),
            supabase
                .from('participant_competitions')
                .select('*, participants(*, teams(name))')
                .eq('competition_id', competitionId)
                .order('participants(name)')
        ]);

        const comp = competition.data;
        const parts = participants.data || [];

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
                        <button onclick="closeInvigilatorModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <h4 class="font-semibold mb-3">Participants (${parts.length})</h4>
                    
                    <div class="space-y-2 max-h-64 overflow-y-auto mb-6">
                        ${parts.map(p => {
                            const participant = p.participants;
                            return `
                                <div class="participant-row ${p.is_reported ? 'reported' : ''}" id="participant-row-${participant.id}">
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-900">${participant.name}</div>
                                        <div class="text-sm text-gray-500">${participant.teams?.name} • Chest #${participant.chest_number}</div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        ${p.is_reported ? `
                                            <span class="text-xs text-red-600 font-medium">Reported</span>
                                        ` : `
                                            <button onclick="reportParticipant(${participant.id}, ${competitionId})" 
                                                    class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200">
                                                Report
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="button" onclick="closeInvigilatorModal()" class="flex-1 btn btn-secondary">
                            Close
                        </button>
                        <button type="button" onclick="markAllPresent(${competitionId})" class="flex-1 btn btn-primary">
                            Mark All Present
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeInvigilatorModal();
        });

    } catch (error) {
        console.error('Error viewing competition details:', error);
        showNotification('Failed to load competition details', 'error');
        window.invigilatorState.isModalOpen = false;
    }
}

async function reportParticipant(participantId, competitionId) {
    if (window.invigilatorState.isProcessing) return;
    
    if (!confirm('Report this participant for irregular behavior?')) {
        return;
    }

    window.invigilatorState.isProcessing = true;

    try {
        const { error } = await supabase
            .from('participant_competitions')
            .update({ 
                is_reported: true, 
                reported_at: new Date().toISOString() 
            })
            .eq('participant_id', participantId)
            .eq('competition_id', competitionId);

        if (error) throw error;

        showNotification('Participant reported successfully');
        
        // Update UI
        const row = document.getElementById(`participant-row-${participantId}`);
        if (row) {
            row.classList.add('reported');
            row.querySelector('.flex.items-center.gap-2').innerHTML = 
                '<span class="text-xs text-red-600 font-medium">Reported</span>';
        }

        // Refresh data
        await refreshInvigilatorData();

    } catch (error) {
        console.error('Error reporting participant:', error);
        showNotification('Failed to report participant', 'error');
    } finally {
        window.invigilatorState.isProcessing = false;
    }
}

async function markAllPresent(competitionId) {
    if (window.invigilatorState.isProcessing) return;
    
    if (!confirm('Mark all participants as present for this competition?')) {
        return;
    }

    window.invigilatorState.isProcessing = true;

    try {
        const { error } = await supabase
            .from('participant_competitions')
            .update({ is_reported: false })
            .eq('competition_id', competitionId);

        if (error) throw error;

        showNotification('All participants marked as present');
        closeInvigilatorModal();
        await refreshInvigilatorData();

    } catch (error) {
        console.error('Error marking all present:', error);
        showNotification('Failed to update attendance', 'error');
    } finally {
        window.invigilatorState.isProcessing = false;
    }
}

function markAttendance() {
    showNotification('Attendance marking feature coming soon', 'info');
}

function reportIssue() {
    showNotification('Issue reporting feature coming soon', 'info');
}

async function refreshInvigilatorData() {
    try {
        const [assignedComps, reports] = await Promise.all([
            supabase
                .from('competition_invigilators')
                .select('*, competitions(*, categories(name)), invigilators(name)')
                .eq('invigilator_id', window.invigilatorState.invigilatorId),
            supabase
                .from('participant_competitions')
                .select('*, competitions(name, categories(name)), participants(name, chest_number, teams(name))')
                .eq('is_reported', true)
        ]);

        window.invigilatorState.assignments = assignedComps.data || [];
        window.invigilatorState.reports = reports.data || [];

        // Update tab counts
        const assignmentsTab = document.getElementById('tab-assignments');
        const reportsTab = document.getElementById('tab-reports');
        
        if (assignmentsTab) {
            assignmentsTab.querySelector('.text-xs').textContent = window.invigilatorState.assignments.length;
        }
        if (reportsTab) {
            reportsTab.querySelector('.text-xs').textContent = window.invigilatorState.reports.length;
        }

    } catch (error) {
        console.error('Error refreshing invigilator data:', error);
    }
}

function closeInvigilatorModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
        window.invigilatorState.isModalOpen = false;
        window.invigilatorState.isProcessing = false;
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
        type === 'success' ? 'bg-green-500' : 
        type === 'info' ? 'bg-blue-500' :
        'bg-red-500'
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
window.loadInvigilatorContent = loadInvigilatorContent;
window.switchInvigilatorTab = switchInvigilatorTab;
window.viewCompetitionDetails = viewCompetitionDetails;
window.reportParticipant = reportParticipant;
window.markAllPresent = markAllPresent;
window.markAttendance = markAttendance;
window.reportIssue = reportIssue;
window.closeInvigilatorModal = closeInvigilatorModal;
window.logout = logout;
