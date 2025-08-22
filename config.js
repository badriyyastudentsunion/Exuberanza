const SUPABASE_URL = 'https://gaxggkvpecbpqzjrigsi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdheGdna3ZwZWNicHF6anJpZ3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0Mjg3OTgsImV4cCI6MjA3MTAwNDc5OH0.WJuDMt5oMdYwtkK8sRQF9aBTtT2N4C29PbgcCHsy068';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Point calculation constants
const POINTS = {
    GRADE: {
        'A+': 6, // 90-100%
        'A': 5,  // 70-89%
        'B': 3,  // 60-69%
        'C': 1   // 50-59%
    },
    INDIVIDUAL: {
        1: 5, // 1st place
        2: 3, // 2nd place
        3: 1  // 3rd place
    },
    GROUP: {
        2: { 1: 7, 2: 5, 3: 3 }, // 2 members
        3: { 1: 10, 2: 7, 3: 4 }, // 3 members
        4: { 1: 15, 2: 10, 3: 5 }, // 4-5 members
        5: { 1: 15, 2: 10, 3: 5 }
    }
};

// User roles
const ROLES = {
    ADMIN: 'admin',
    TEAM_LEADER: 'team_leader',
    INVIGILATOR: 'invigilator',
    JUDGE: 'judge',
    ANNOUNCER: 'announcer'
};

// Utility functions
const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch {
        return {};
    }
};

const setCurrentUser = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
};

const logout = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
};

const showNotification = (message, type = 'success') => {
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
};

const generateQRCode = (data) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
};

const generateCodeLetter = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, etc.
};

// Generate unique chest number for participant
const generateChestNumber = async (teamId) => {
    try {
        // Get all existing participants for this team to find the next available number
        const { data: existingParticipants, error } = await supabase
            .from('participants')
            .select('chest_number')
            .eq('team_id', teamId)
            .order('chest_number');
        
        if (error) {
            console.error('Error fetching existing participants:', error);
            throw error;
        }
        
        // Extract numbers from existing chest numbers for this team
        const teamPrefix = teamId.toString();
        const existingNumbers = existingParticipants
            .filter(p => p.chest_number && p.chest_number.startsWith(teamPrefix))
            .map(p => {
                const numberPart = p.chest_number.substring(teamPrefix.length);
                return parseInt(numberPart) || 0;
            })
            .filter(n => !isNaN(n))
            .sort((a, b) => a - b);
        
        // Find the next available number
        let nextNumber = 1;
        for (const num of existingNumbers) {
            if (num === nextNumber) {
                nextNumber++;
            } else {
                break;
            }
        }
        
        // Format as team_id + padded number (e.g., "101", "102", etc.)
        return `${teamPrefix}${String(nextNumber).padStart(2, '0')}`;
    } catch (error) {
        console.error('Error generating chest number:', error);
        throw error;
    }
};





const loadJudgeContent = (content, user) => {
    content.innerHTML = `
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold mb-4">Judge Dashboard</h2>
            <p>Welcome, ${user.name}</p>
            <div class="mt-4 p-4 bg-blue-50 rounded">
                <p class="text-blue-800">Judge functionality will be available soon.</p>
            </div>
        </div>
    `;
};

const loadAnnouncerContent = (content, user) => {
    content.innerHTML = `
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold mb-4">Announcer Dashboard</h2>
            <p>Welcome, ${user.name || user.username}</p>
            <div class="mt-4 p-4 bg-blue-50 rounded">
                <p class="text-blue-800">Announcer functionality will be available soon.</p>
            </div>
        </div>
    `;
};
