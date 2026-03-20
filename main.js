// ============================================
// MAIN.JS - COMPLETE REWRITE
// Bulletproof, no random failures
// ============================================

let currentGrade = null;
let currentSubject = null;
let currentSubjectName = null;
let viewHistory = [];
let selectedUnits = [];
let currentUsername = '';

// Toast tracking
let toastQueue = [];
let isProcessingToast = false;
const MAX_VISIBLE_TOASTS = 2;
const TOAST_DURATION = 3000;

// Subject data - ALL KEYS MUST MATCH link.js
const subjectsData = {
    9: [
        { name: 'Mathematics', icon: '📐', deco: ['📏', '🔢'], subtitle: 'Algebra & Geometry', key: 'math' },
        { name: 'Physics', icon: '⚛️', deco: ['🔭', '⚡'], subtitle: 'Mechanics & Energy', key: 'phy' },
        { name: 'Biology', icon: '🧬', deco: ['🦠', '🌱'], subtitle: 'Life Sciences', key: 'bio' },
        { name: 'Chemistry', icon: '⚗️', deco: ['🧪', '🔥'], subtitle: 'Elements & Reactions', key: 'chem' },
        { name: 'Geography', icon: '🌍', deco: ['🗺️', '🧭'], subtitle: 'Physical Geography', key: 'geo' },
        { name: 'Economy', icon: '📊', deco: ['💰', '📈'], subtitle: 'Basic Economics', key: 'eco' },
        { name: 'History', icon: '🏛️', deco: ['📜', '⏳'], subtitle: 'World History', key: 'his' },
        { name: 'Citizenship', icon: '🏛️', deco: ['🤝', '🌍'], subtitle: 'Civic Education', key: 'citizenship' },
        
        { name: 'ICT', icon: '💻', deco: ['⌨️', '🌐'], subtitle: 'Information Technology', key: 'ict' }
    ],
    10: [
        { name: 'Mathematics', icon: '📐', deco: ['📏', '🔢'], subtitle: 'Advanced Algebra', key: 'math' },
        { name: 'Physics', icon: '⚛️', deco: ['🔭', '⚡'], subtitle: 'Advanced Mechanics', key: 'phy' },
        { name: 'Biology', icon: '🧬', deco: ['🦠', '🌱'], subtitle: 'Advanced Biology', key: 'bio' },
        { name: 'Chemistry', icon: '⚗️', deco: ['🧪', '🔥'], subtitle: 'Organic Chemistry', key: 'chem' },
        { name: 'Geography', icon: '🌍', deco: ['🗺️', '🧭'], subtitle: 'Human Geography', key: 'geo' },
        { name: 'Economy', icon: '📊', deco: ['💰', '📈'], subtitle: 'Macroeconomics', key: 'eco' },
        { name: 'History', icon: '🏛️', deco: ['📜', '⏳'], subtitle: 'Modern History', key: 'his' },
        { name: 'Citizenship', icon: '🏛️', deco: ['🤝', '🌍'], subtitle: 'Advanced Civics', key: 'citizenship' },
        
        { name: 'ICT', icon: '💻', deco: ['⌨️', '🌐'], subtitle: 'Advanced Computing', key: 'ict' }
    ],
    11: [
        { name: 'Mathematics', icon: '📐', deco: ['📏', '🔢'], subtitle: 'Calculus', key: 'math' },
        { name: 'Physics', icon: '⚛️', deco: ['🔭', '⚡'], subtitle: 'Advanced Physics', key: 'phy' },
        { name: 'Biology', icon: '🧬', deco: ['🦠', '🧪'], subtitle: 'Molecular Biology', key: 'bio' },
        { name: 'Chemistry', icon: '⚗️', deco: ['🧪', '⚛️'], subtitle: 'Physical Chemistry', key: 'chem' },
        { name: 'Agriculture', icon: '🌾', deco: ['🚜', '🌱'], subtitle: 'Crop & Animal Production', key: 'agri' },
        
        { name: 'ICT', icon: '💻', deco: ['⌨️', '💡'], subtitle: 'Computer Science', key: 'ict' }
    ],
    12: [
        { name: 'Mathematics', icon: '📐', deco: ['📊', '🔢'], subtitle: 'Statistics & Calculus', key: 'math' },
        { name: 'Physics', icon: '⚛️', deco: ['🔭', '🌌'], subtitle: 'Quantum Physics', key: 'phy' },
        { name: 'Biology', icon: '🧬', deco: ['🧪', '🧠'], subtitle: 'Advanced Biology', key: 'bio' },
        { name: 'Chemistry', icon: '⚗️', deco: ['⚛️', '🔬'], subtitle: 'Advanced Chemistry', key: 'chem' },
        { name: 'Agriculture', icon: '🌾', deco: ['🚜', '🌱'], subtitle: 'Crop & Animal Production', key: 'agri' },
        
        { name: 'ICT', icon: '💻', deco: ['🖥️', '🚀'], subtitle: 'Software Engineering', key: 'ict' }
    ]
};

// Wave colors for subjects
const subjectWaveColors = {
    math: '#3b82f6',
    chem: '#10b981',
    bio: '#22c55e',
    phy: '#f59e0b',
    geo: '#8b5cf6',
    eco: '#ec4899',
    his: '#ef4444',
    citizenship: '#06b6d4',
    ict: '#6366f1',
    agri: '#84cc16',
   
};

// Short names for display
const shortSubjectNames = {
    'Mathematics': 'Math',
    'Chemistry': 'Chem',
    'Biology': 'Bio',
    'Physics': 'Phy',
    'Geography': 'Geo',
    'Economy': 'Eco',
    'History': 'Hist',
    'Citizenship': 'Civic',
   
    'ICT': 'ICT',
    'Agriculture': 'Agri'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function dismissToast(toast) {
    if (!toast || toast.classList.contains('dismissing')) return;
    toast.classList.add('dismissing');
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
        const index = toastQueue.indexOf(toast);
        if (index > -1) toastQueue.splice(index, 1);
    }, 300);
}

function processToastQueue() {
    if (isProcessingToast) return;
    isProcessingToast = true;
    while (toastQueue.length > MAX_VISIBLE_TOASTS) {
        const oldest = toastQueue.shift();
        if (oldest && oldest.parentNode) oldest.remove();
    }
    isProcessingToast = false;
}

function showToast(message, type = 'info', duration = TOAST_DURATION) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    processToastQueue();
    
    if (toastQueue.length >= MAX_VISIBLE_TOASTS) {
        const oldest = toastQueue.shift();
        if (oldest && oldest.parentNode) oldest.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
    toast.innerHTML = `<span class="toast-icon material-icons">${icons[type]}</span><span>${message}</span>`;
    toast.style.cursor = 'pointer';
    toast.onclick = () => dismissToast(toast);
    
    toastQueue.push(toast);
    container.appendChild(toast);
    toast.offsetHeight;
    requestAnimationFrame(() => toast.classList.add('show'));
    
    const timeout = setTimeout(() => dismissToast(toast), duration);
    toast.addEventListener('click', () => clearTimeout(timeout), { once: true });
}

// ============================================
// SIDEBAR
// ============================================

function toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
}

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('fixedToggle');
    if (toggle) toggle.addEventListener('click', toggleSidebar);
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            toggleSidebar();
        }
    });
});

// ============================================
// VIEW MANAGEMENT
// ============================================

let currentView = 'gradeView';

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        currentView = viewId;
    }
}

// ============================================
// GRADE VIEW
// ============================================

function showSubjects(grade) {
    console.log('showSubjects called with grade:', grade);
    
    // Validate grade exists
    if (!subjectsData[grade]) {
        console.error('Invalid grade:', grade);
        showToast('Error: Invalid grade', 'error');
        return;
    }
    
    currentGrade = grade;
    viewHistory = ['grade'];
    
    renderSubjectCards(grade);
    
    const titleEl = document.getElementById('subjectTitle');
    if (titleEl) titleEl.textContent = `Grade ${grade}`;
    
    // Add back button
    const viewHeader = document.querySelector('#subjectView .view-header');
    if (viewHeader) {
        let backBtn = viewHeader.querySelector('.back-btn');
        if (!backBtn) {
            backBtn = document.createElement('button');
            backBtn.className = 'back-btn';
            backBtn.innerHTML = '<span class="material-icons">arrow_back</span>';
            backBtn.onclick = goBack;
            viewHeader.insertBefore(backBtn, viewHeader.firstChild);
        }
    }
    
    switchView('subjectView');
    console.log('Switched to subjectView for grade', grade);
}

// ============================================
// SUBJECT VIEW
// ============================================

function renderSubjectCards(grade) {
    console.log('renderSubjectCards for grade:', grade);
    
    const grid = document.getElementById('subjectGrid');
    if (!grid) {
        console.error('subjectGrid not found!');
        return;
    }
    
    const subjects = subjectsData[grade];
    if (!subjects) {
        console.error('No subjects for grade:', grade);
        return;
    }
    
    // Set grid class
    const gridClass = (grade === 9 || grade === 10) ? 'subjects-10' : 'subjects-6';
    grid.className = `cards-grid ${gridClass}`;
    
    // Build HTML
    grid.innerHTML = subjects.map((subject, index) => {
        const waveColor = subjectWaveColors[subject.key] || '#6366f1';
        return `
            <div class="card subject" 
                 data-card="subject${index}" 
                 data-subject="${subject.key}"
                 onclick="handleSubjectClick('${subject.key}', '${subject.name}')"
                 style="animation-delay: ${index * 0.05}s">
                <div class="card-bg-pattern"></div>
                <div class="card-float">
                    <div class="emoji-scene">
                        <div class="emoji-main">${subject.icon}</div>
                        <div class="emoji-deco d1">${subject.deco[0]}</div>
                        <div class="emoji-deco d2">${subject.deco[1]}</div>
                    </div>
                </div>
                <div class="text-content">
                    <div class="card-title">${subject.name}</div>
                    <div class="card-subtitle">${subject.subtitle}</div>
                </div>
                <div class="card-wave" style="background: linear-gradient(90deg, transparent, ${waveColor}, transparent)"></div>
            </div>
        `;
    }).join('');
    
    console.log('Rendered', subjects.length, 'subjects');
}

function handleSubjectClick(subjectKey, subjectName) {
    console.log('Subject clicked:', subjectKey, subjectName);
    
    // Validate data exists
    if (!currentGrade) {
        console.error('No current grade!');
        showToast('Error: No grade selected', 'error');
        return;
    }
    
    if (!data || !data[currentGrade]) {
        console.error('No data for grade:', currentGrade);
        showToast('Error: Data not loaded', 'error');
        return;
    }
    
    if (!data[currentGrade][subjectKey]) {
        console.error('No data for subject:', subjectKey, 'in grade', currentGrade);
        console.log('Available subjects:', Object.keys(data[currentGrade]));
        showToast(`Error: ${subjectName} data not found`, 'error');
        return;
    }
    
    showUnits(subjectKey, subjectName);
}

// ============================================
// UNIT VIEW
// ============================================

function showUnits(subjectKey, subjectName) {
    console.log('showUnits called:', subjectKey, subjectName);
    
    // Validate
    if (!currentGrade || !data || !data[currentGrade] || !data[currentGrade][subjectKey]) {
        console.error('Invalid state for showUnits');
        showToast('Error loading units', 'error');
        return;
    }
    
    currentSubject = subjectKey;
    currentSubjectName = subjectName;
    viewHistory.push('subject');
    
    const subjectData = data[currentGrade][subjectKey];
    const units = subjectData.units;
    
    const grid = document.getElementById('unitGrid');
    if (!grid) {
        console.error('unitGrid not found!');
        return;
    }
    
    // Clear and rebuild
    grid.innerHTML = '';
    
    const shortSubject = shortSubjectNames[subjectName] || subjectName.substring(0, 4);
    
    let unitIndex = 1;
    for (const [unitName, links] of Object.entries(units)) {
        const div = document.createElement('div');
        div.className = 'unit-box';
        div.innerHTML = `
            <div class="unit-info">
                <div class="unit-number">Unit ${unitIndex}</div>
                <div class="unit-name">${unitName.replace(`Unit ${unitIndex}: `, '')}</div>
            </div>
            <span class="unit-arrow material-icons">arrow_forward</span>
        `;
        
        // Check if selected
        const isSelected = selectedUnits.some(u => 
            u.grade === currentGrade && 
            u.subject === subjectName && 
            u.unit === unitName
        );
        
        if (isSelected) div.classList.add('selected');
        
        // Use onclick with proper binding
        div.onclick = function(e) {
            e.stopPropagation();
            toggleUnitSelection(this, unitName, links);
        };
        
        grid.appendChild(div);
        unitIndex++;
    }
    
    // Set title
    const titleEl = document.getElementById('unitTitle');
    if (titleEl) titleEl.textContent = `${shortSubject} - G${currentGrade}`;
    
    // Add back button
    const viewHeader = document.querySelector('#unitView .view-header');
    if (viewHeader) {
        let backBtn = viewHeader.querySelector('.back-btn');
        if (!backBtn) {
            backBtn = document.createElement('button');
            backBtn.className = 'back-btn';
            backBtn.innerHTML = '<span class="material-icons">arrow_back</span>';
            backBtn.onclick = goBack;
            viewHeader.insertBefore(backBtn, viewHeader.firstChild);
        }
    }
    
    switchView('unitView');
    console.log('Switched to unitView with', unitIndex - 1, 'units');
}

function toggleUnitSelection(element, unitName, links) {
    console.log('toggleUnitSelection:', unitName);
    
    const existingIndex = selectedUnits.findIndex(u => 
        u.grade === currentGrade && 
        u.subject === currentSubjectName && 
        u.unit === unitName
    );
    
    if (existingIndex > -1) {
        selectedUnits.splice(existingIndex, 1);
        element.classList.remove('selected');
        showToast('Unit removed from collection', 'info');
    } else {
        selectedUnits.push({
            grade: currentGrade,
            subject: currentSubjectName,
            unit: unitName,
            downloadLink: links.download,
            shareLink: links.share
        });
        element.classList.add('selected');
        showToast('Unit added to collection', 'success');
    }
    
    updateSelectionUI();
}

// ============================================
// NAVIGATION
// ============================================

function goBack() {
    console.log('goBack called, currentView:', currentView, 'history:', viewHistory);
    
    if (currentView === 'subjectView') {
        switchView('gradeView');
        currentGrade = null;
        viewHistory = [];
    } else if (currentView === 'unitView') {
        viewHistory.pop();
        if (currentGrade) {
            renderSubjectCards(currentGrade);
            switchView('subjectView');
        } else {
            switchView('gradeView');
        }
    }
}

// ============================================
// SELECTION PANEL
// ============================================

function toggleSelectionPanel() {
    const panel = document.getElementById('selectionPanel');
    if (panel) panel.classList.toggle('open');
}

function updateSelectionUI() {
    const badge = document.getElementById('fabBadge');
    const list = document.getElementById('selectionList');
    const countEl = document.getElementById('selectionCount');
    const footerCount = document.getElementById('footerCount');
    const footer = document.getElementById('selectionFooter');
    const clearBtn = document.getElementById('clearBtn');
    const doneBtn = document.getElementById('doneBtn');
    
    if (badge) {
        badge.textContent = selectedUnits.length;
        badge.classList.toggle('show', selectedUnits.length > 0);
    }
    
    if (selectedUnits.length === 0) {
        if (countEl) countEl.textContent = 'No units selected';
        if (footer) footer.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
        if (doneBtn) doneBtn.disabled = true;
        
        if (list) {
            list.innerHTML = `
                <div class="selection-empty">
                    <div class="empty-illustration"></div>
                    <h4>Start Building</h4>
                    <p>Click on units to add them to your collection for AI processing</p>
                </div>
            `;
        }
    } else {
        if (countEl) countEl.textContent = `${selectedUnits.length} unit${selectedUnits.length > 1 ? 's' : ''} selected`;
        if (footer) footer.style.display = 'flex';
        if (clearBtn) clearBtn.style.display = 'flex';
        if (doneBtn) doneBtn.disabled = false;
        if (footerCount) footerCount.textContent = selectedUnits.length;
        
        if (list) {
            list.innerHTML = selectedUnits.map((item, index) => `
                <div class="selection-item">
                    <div class="selection-item-icon">
                        <span class="material-icons">description</span>
                    </div>
                    <div class="selection-info">
                        <div class="selection-unit">${item.unit}</div>
                        <div class="selection-grade">Grade ${item.grade} • ${item.subject}</div>
                    </div>
                    <button class="remove-btn" onclick="removeSelection(${index})" title="Remove">
                        <span class="material-icons">close</span>
                    </button>
                </div>
            `).join('');
        }
    }
}

function removeSelection(index) {
    const removed = selectedUnits[index];
    selectedUnits.splice(index, 1);
    updateSelectionUI();
    
    // Update visual state if in unit view
    if (currentView === 'unitView' && removed.grade === currentGrade && removed.subject === currentSubjectName) {
        document.querySelectorAll('.unit-box').forEach(box => {
            const unitNameEl = box.querySelector('.unit-name');
            const unitNumberEl = box.querySelector('.unit-number');
            if (unitNameEl && unitNumberEl) {
                const fullName = unitNumberEl.textContent + ': ' + unitNameEl.textContent;
                if (fullName === removed.unit) box.classList.remove('selected');
            }
        });
    }
    
    showToast('Unit removed', 'info');
}

function clearAllSelections() {
    selectedUnits = [];
    
    if (currentView === 'unitView') {
        document.querySelectorAll('.unit-box.selected').forEach(box => {
            box.classList.remove('selected');
        });
    }
    
    updateSelectionUI();
    showToast('All units cleared', 'info');
}

// ============================================
// AI MODAL
// ============================================

function openAIModal() {
    if (selectedUnits.length === 0) {
        showToast('Please select at least one unit first', 'warning');
        return;
    }
    const modal = document.getElementById('aiModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('selectionPanel')?.classList.remove('open');
    }
}

function closeAIModal() {
    document.getElementById('aiModal')?.classList.remove('open');
}

function showCustomURL() {
    // Close AI modal and open custom URL modal as separate popup
    closeAIModal();
    const overlay = document.getElementById('customURLOverlay');
    if (overlay) {
        overlay.classList.add('open');
        setTimeout(() => document.getElementById('customURLInput')?.focus(), 100);
    }
}

function backToAI() {
    // Close custom URL modal and go back to AI modal
    document.getElementById('customURLOverlay')?.classList.remove('open');
    setTimeout(() => {
        const aiModal = document.getElementById('aiModal');
        if (aiModal) aiModal.classList.add('open');
    }, 150);
}

function closeCustomURLModal() {
    document.getElementById('customURLOverlay')?.classList.remove('open');
    const input = document.getElementById('customURLInput');
    if (input) input.value = '';
}

async function selectAI(type) {
    const urls = {
        notebook: 'https://notebooklm.google.com/',
        gemini: 'https://gemini.google.com/',
        deepseek: 'https://chat.deepseek.com/',
        grok: 'https://grok.x.ai/'
    };
    
    await processSelection(type, urls[type]);
}

async function submitCustomURL() {
    const input = document.getElementById('customURLInput');
    const url = input?.value.trim();
    
    if (!url) {
        showToast('Please enter a URL', 'warning');
        return;
    }
    if (!url.startsWith('http')) {
        showToast('Please enter a valid URL starting with http:// or https://', 'error');
        return;
    }
    await processSelection('other', url);
}

async function processSelection(aiType, targetUrl) {
    closeAIModal();
    closeCustomURLModal();
    
    const loader = document.getElementById('loader');
    const stepText = document.getElementById('step');
    if (loader) loader.style.display = 'flex';
    
    const isNotebookLM = aiType === 'notebook';
    const linkType = isNotebookLM ? 'downloadLink' : 'shareLink';
    const linkLabel = isNotebookLM ? 'download' : 'share';
    
    const validUnits = selectedUnits.filter(u => u[linkType] && u[linkType] !== 'LINK_HERE');
    
    if (validUnits.length === 0) {
        if (loader) loader.style.display = 'none';
        showToast(`No valid ${linkLabel} links available for selected units`, 'error');
        return;
    }
    
    const allLinks = validUnits.map(u => u[linkType]).join('\n\n');
    try {
        await navigator.clipboard.writeText(allLinks);
        if (stepText) stepText.innerText = `Copied ${validUnits.length} ${linkLabel} links...`;
        showToast(`${validUnits.length} links copied to clipboard`, 'success');
    } catch (err) {
        if (stepText) stepText.innerText = 'Opening AI tool...';
    }
    
    setTimeout(() => {
        if (stepText) stepText.innerText = 'Opening...';
        setTimeout(() => {
            if (loader) loader.style.display = 'none';
            window.open(targetUrl, '_blank');
        }, 800);
    }, 800);
}

// Close modals on backdrop click
document.addEventListener('DOMContentLoaded', () => {
    const aiModal = document.getElementById('aiModal');
    const customOverlay = document.getElementById('customURLOverlay');
    
    if (aiModal) {
        aiModal.addEventListener('click', (e) => {
            if (e.target === aiModal) closeAIModal();
        });
    }
    
    if (customOverlay) {
        customOverlay.addEventListener('click', (e) => {
            if (e.target === customOverlay) closeCustomURLModal();
        });
    }
});

// ============================================
// COFFEE MODAL
// ============================================

function showBuyCoffeeModal() {
    document.getElementById('buyCoffeeModal')?.classList.add('show');
    if (window.innerWidth <= 768) {
        document.body.classList.remove('sidebar-open');
    }
}

function closeBuyCoffeeModal() {
    document.getElementById('buyCoffeeModal')?.classList.remove('show');
}

function buyCoffee() {
    const input = document.getElementById('coffeeAmount');
    const amount = input?.value;
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'warning');
        return;
    }
    showToast(`Thank you for buying a coffee for $${amount}! ☕️`, 'success');
    closeBuyCoffeeModal();
}

// ============================================
// DEVICES MODAL
// ============================================

async function showUserDevicesModal() {
    const user = auth?.currentUser;
    if (!user) {
        showToast('You are not logged in', 'error');
        return;
    }

    const modal = document.getElementById('userDevicesModal');
    const devicesList = document.getElementById('devicesList');
    
    if (devicesList) devicesList.innerHTML = '<div class="device-item">Loading...</div>';
    modal?.classList.add('show');

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            if (devicesList) devicesList.innerHTML = '<div class="device-item">No device info found</div>';
            return;
        }

        const devices = userDoc.data().devices || [];
        if (devices.length === 0) {
            if (devicesList) devicesList.innerHTML = '<div class="device-item">No devices registered</div>';
        } else {
            if (devicesList) {
                devicesList.innerHTML = devices.map(d => `
                    <div class="device-item">
                        <span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 8px;">devices</span>
                        ${d.deviceName || 'Unknown device'}
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error fetching devices:', error);
        if (devicesList) devicesList.innerHTML = '<div class="device-item">Error loading devices</div>';
        showToast('Failed to load devices', 'error');
    }
}

function closeUserDevicesModal() {
    document.getElementById('userDevicesModal')?.classList.remove('show');
}

function generateDeviceId() {
    const ua = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}`;
    const color = window.screen.colorDepth;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const platform = navigator.platform;
    const cores = navigator.hardwareConcurrency || 'unknown';
    const touch = navigator.maxTouchPoints || 0;
    
    const fingerprint = `${ua}-${screen}-${color}-${timezone}-${language}-${platform}-${cores}-${touch}`;
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `dev_${Math.abs(hash).toString(36)}`;
}

async function logoutCurrentDevice() {
    const user = auth?.currentUser;
    
    if (!user) {
        closeUserDevicesModal();
        document.getElementById('appContainer')?.classList.remove('active');
        document.getElementById('loginContainer')?.classList.remove('hidden');
        return;
    }

    const deviceId = window.currentDeviceId || generateDeviceId();
    
    if (!deviceId) {
        showToast('Device ID not found', 'error');
        return;
    }

    try {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            const devices = userDoc.data().devices || [];
            const updated = devices.filter(d => d.deviceId !== deviceId);
            await userRef.update({ devices: updated });
        }

        await auth.signOut();
        showToast('Logged out from this device', 'success');
        closeUserDevicesModal();
        
        loginValidated = false;
        document.getElementById('appContainer')?.classList.remove('active');
        document.getElementById('loginContainer')?.classList.remove('hidden');
        
        const userAccount = document.getElementById('userAccount');
        if (userAccount) userAccount.textContent = 'A';
        
        document.getElementById('phoneInput').value = '';
        document.getElementById('usernameInput').value = '';
        document.getElementById('passwordInput').value = '';
        window.currentUsername = '';
        
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Failed to logout', 'error');
    }
}
// ============================================
// SPLASH SCREEN - Click first, then loading
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splashScreen');
    const loginContainer = document.getElementById('loginContainer');
    const appContainer = document.getElementById('appContainer');
    
    if (!splash) return;
    
    // Create loading overlay inside splash (hidden initially)
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'splashLoading';
    loadingOverlay.innerHTML = '<div class="splash-spinner"></div>';
    loadingOverlay.style.cssText = `
        position: absolute;
        inset: 0;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease;
        z-index: 100;
    `;
    splash.appendChild(loadingOverlay);
    
    let isProcessing = false;
    
    // Handle tap on splash
    const handleTap = (e) => {
        // Prevent multiple clicks
        if (isProcessing) return;
        isProcessing = true;
        
        // Show full white loading screen with spinner
        loadingOverlay.style.opacity = '1';
        loadingOverlay.style.visibility = 'visible';
        
        // Now check auth
        checkAuthAndProceed();
    };
    
    splash.addEventListener('click', handleTap);
    splash.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleTap(e);
    }, { passive: false });
    
    function checkAuthAndProceed() {
        // Check if already have auth state
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe(); // Only check once
            
            if (user) {
                // Logged in - show app
                setTimeout(() => {
                    splash.remove();
                    
                    if (loginContainer) loginContainer.classList.add('hidden');
                    if (appContainer) {
                        appContainer.classList.add('active');
                        if (window.innerWidth > 1024) {
                            appContainer.style.transform = 'scale(0.8)';
                            appContainer.style.transformOrigin = 'center center';
                            appContainer.style.width = '125%';
                            appContainer.style.height = '125%';
                            appContainer.style.position = 'absolute';
                            appContainer.style.top = '-12.5%';
                            appContainer.style.left = '-12.5%';
                        }
                    }
                    
                    setupDevicesListener(user.uid);
                    window.currentUsername = user.displayName || 'User';
                    
                    const userAccount = document.getElementById('userAccount');
                    if (userAccount && window.currentUsername) {
                        userAccount.textContent = window.currentUsername.charAt(0).toUpperCase();
                    }
                    
                    showToast(`Welcome back!`, 'success');
                }, 800); // Brief delay to show spinner
            } else {
                // Not logged in - show login
                setTimeout(() => {
                    splash.remove();
                    if (loginContainer) loginContainer.classList.remove('hidden');
                }, 800);
            }
        });
    }
});

function hideSplash() {
    const splash = document.getElementById('splashScreen');
    if (!splash || splash.classList.contains('splash-hidden')) return;
    
    splash.classList.add('splash-hidden');
    
    setTimeout(() => {
        if (splash.parentNode) splash.remove();
    }, 500);
}
// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Main.js initialized');
    updateSelectionUI();
});
