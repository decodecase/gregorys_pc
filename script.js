// DOM Elements
const lockScreen = document.getElementById('lock-screen');
const desktop = document.getElementById('desktop');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('error-msg');
const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const windowsContainer = document.getElementById('windows-container');

// State
let activeWindows = [];
let zIndex = 10;
let isDragging = false;
let currentWindow = null;
let offsetX, offsetY;

// Password
const PASSWORD = '1733';

// Notes data - we'll store the content directly here
const notesData = {
    'call_clark_about_policy.txt': `Edwin to clarify health insurance status.
Ask about last amendment clause.
Find out what "emergency override" means.`,
    'garden_tasks_autumn.txt': `• Prune the west hedge
• Replace the dead rosemary pots
• Ask Beatrice if she still wants the oak removed
• Cover the swing set before frost`,
    'if_they_ever_find_this.txt': `If they ever open this, then it means the mask broke.
I never wanted to confess.
Not in a courtroom. Not in a letter. Not even to her.
But they're all watching me now, like they already know.
Maybe that's what guilt looks like: knowing everyone else suspects, and not being able to stop them.`,
    'kitchen_incident.txt': `The tea tasted different last night.
Not bad, just unfamiliar.
I said nothing.
She was watching me the whole time.
I wonder if she thought I'd notice.`,
    'laundry_service_contact.txt': `Cetin Cleaners – 01423 988117
Pick up on Mondays. Ask for Raymond.
Never starch the collars again.`,
    'one_of_them_knows.txt': `I'm certain now — someone saw the draft.
But they didn't confront me. They've been too quiet.
That silence is the part that unnerves me.
Julian would've shouted.
Beatrice would've cried.
This one just… nodded at dinner.`,
    'quiet_threats.txt': `Some threats are shouted.
Others are baked into habits, little gestures, tone.
Hers come folded in cloth and served with lemon.
I've lived with it long enough to know the difference.`,
    'recordings_deleted.txt': `I couldn't find the camera log from the west hallway.
It should have been automatic.
Checked the console — someone manually accessed it at 18:47.
If it's who I think it is, then I misjudged them badly. Again.`,
    'she_never_called_me_father.txt': `Strange how someone can speak to you for years
and never once use your name.
Not the real one, anyway.
I called her my mistake in private.
And yet I keep building her a future I won't even see.`,
    'wine_cabinet_inventory.txt': `Château Lafite 1989 – 2 bottles (1 opened)
Glenfarclas 25 yr – low
Henri Jayer (reserved)
Remove bottle from dining room, label unreadable`
};

// Initialize
function init() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Set focus to password input
    passwordInput.focus();
    
    // Add event listeners
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            unlock();
        }
    });
    
    // Add window dragging functionality
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDragging);
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    
    // Format time (e.g., 11:23 AM)
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = now.getMinutes().toString().padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes} ${ampm}`;
    
    // Format date (e.g., 5/23/2025)
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    dateElement.textContent = `${month}/${day}/${year}`;
}

// Unlock the desktop
function unlock() {
    const password = passwordInput.value.trim();
    
    if (password === PASSWORD) {
        // Hide error message if visible
        errorMsg.classList.add('hidden');
        
        // Fade out lock screen
        lockScreen.style.opacity = '0';
        
        // After fade out, hide lock screen and show desktop
        setTimeout(() => {
            lockScreen.classList.add('hidden');
            desktop.classList.remove('hidden');
            desktop.classList.add('fade-in');
        }, 300);
    } else {
        // Show error message
        errorMsg.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Function to load and display notes
function loadNotes() {
    try {
        let notesHTML = '<div class="notes-container">';
        
        // Add each note as a clickable item
        Object.keys(notesData).forEach(note => {
            const displayName = note.replace(/_/g, ' ').replace(/\.txt$/, '');
            notesHTML += `
                <div class="note-item" onclick="showNoteContent('${note}')">
                    <i class="fas fa-file-alt"></i>
                    <span>${displayName}</span>
                </div>`;
        });
        
        notesHTML += '</div><div id="note-content" class="note-content"></div>';
        return notesHTML;
    } catch (error) {
        console.error('Error loading notes:', error);
        return '<div class="error">Error loading notes. Please try again later.</div>';
    }
}

// Function to show note content in a modal
function showNoteContent(noteId) {
    try {
        const content = notesData[noteId] || 'Content not found.';
        const displayName = noteId.replace(/_/g, ' ').replace(/\.txt$/, '');
        
        // Create or update modal
        let modal = document.getElementById('note-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'note-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${displayName}</h3>
                    <button class="close-btn" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <pre>${content}</pre>
                </div>
            </div>`;
            
        modal.style.display = 'flex';
        
        // Add click outside to close
        modal.onclick = function(e) {
            if (e.target === modal) closeModal();
        };
        
        // Add escape key to close
        document.onkeydown = function(e) {
            if (e.key === 'Escape') closeModal();
        };
        
    } catch (error) {
        console.error('Error showing note:', error);
        alert('Error showing note. Please try again.');
    }
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('note-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Legal Documents data
const legalDocuments = [
    {
        id: 'ashford_estate_map',
        title: 'Ashford Estate Map',
        file: 'Docs/Legal Documents/Ashford Estate Map.png',
        type: 'image',
        date: '4/15/2025',
        size: '2.4 MB'
    },
    {
        id: 'tenancy_contract',
        title: 'Tenancy Contract - Gleaming Cottage',
        file: 'Docs/Legal Documents/Tenancy_Contract_Gleaming_Cottage.png',
        type: 'document',
        date: '3/22/2025',
        size: '1.8 MB'
    },
    {
        id: 'thomas_grey_agreement',
        title: 'Thomas Grey Agreement',
        file: 'Docs/Legal Documents/Thomas Grey Agreement.png',
        type: 'document',
        date: '5/10/2025',
        size: '2.1 MB'
    }
];

// Downloads data
const downloads = [
    {
        id: 'ashford_trust_october',
        title: 'Ashford Trust - October',
        file: 'Docs/Downloads/Ashford Trust October.png',
        type: 'document',
        date: '10/15/2024',
        size: '1.9 MB'
    },
    {
        id: 'beatrice_photo',
        title: 'Beatrice Photo 2021',
        file: 'Docs/Downloads/photo_2021_beatrice_taped.png',
        type: 'image',
        date: '8/22/2021',
        size: '3.2 MB'
    },
    {
        id: 'tea_catalogue',
        title: 'Tea Catalogue 2023',
        file: 'Docs/Downloads/tea_catalogue_2023.png',
        type: 'document',
        date: '1/5/2023',
        size: '2.7 MB'
    }
];

// Private folder data
const privateDocuments = [
    {
        id: 'old_will',
        title: 'Old Will',
        file: 'Docs/Private/Old Will.png',
        type: 'document',
        date: '6/12/2020',
        size: '2.1 MB'
    },
    {
        id: 'missed_letters',
        title: 'Missed Letters to Her',
        file: 'Docs/Private/missed_letters_to_her.png',
        type: 'image',
        date: '9/3/2024',
        size: '1.2 MB'
    }
];

// Audio Recordings data
const audioRecordings = [
    {
        id: 'audio_recording_note',
        title: 'Audio Recording',
        file: 'Audio Recordings/audio_recording_note.mp3',
        date: '5/24/2025',
        duration: '1:23'
    }
];

// Open a new window
async function openWindow(type) {
    const windowId = 'window-' + Date.now();
    const windowElement = document.createElement('div');
    windowElement.className = 'window';
    windowElement.id = windowId;
    
    // Set window title and content based on type
    let title = '';
    let content = '';
    
    switch (type) {
        case 'notes':
            title = 'Notes';
            content = `
                <div class="window-content">
                    ${loadNotes()}
                </div>`;
            break;
        case 'documents':
            title = 'Documents';
            content = `
                <div class="window-content scrollable">
                    <div class="documents-container">
                        <div class="document-folder" onclick="openFolder('legal')">
                            <i class="fas fa-folder"></i>
                            <span>Legal Documents</span>
                            <span class="folder-info">${legalDocuments.length} items</span>
                        </div>
                        <div class="document-folder" onclick="openFolder('archive')">
                            <i class="fas fa-archive"></i>
                            <span>Archive</span>
                            <span class="folder-info">0 items</span>
                        </div>
                        <div class="document-folder" onclick="openFolder('private')">
                            <i class="fas fa-lock"></i>
                            <span>Private</span>
                            <span class="folder-info">${privateDocuments.length} items</span>
                        </div>
                        <div class="document-folder" onclick="openFolder('downloads')">
                            <i class="fas fa-download"></i>
                            <span>Downloads</span>
                            <span class="folder-info">${downloads.length} items</span>
                        </div>
                    </div>
                    <div id="folder-contents" class="folder-contents" style="display: none;">
                        <div class="folder-header">
                            <button class="back-button" onclick="showMainView()">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>
                            <h3 id="folder-title"></h3>
                        </div>
                        <div id="documents-grid" class="documents-grid"></div>
                    </div>
                </div>
                <style>
                    .folder-contents {
                        margin-top: 10px;
                    }
                    .folder-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    .back-button {
                        background: none;
                        border: none;
                        color: #0078d7;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        font-size: 14px;
                        margin-right: 15px;
                    }
                    .back-button i {
                        margin-right: 5px;
                    }
                    .documents-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                        gap: 15px;
                        padding: 10px;
                    }
                    .document-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 15px;
                        border-radius: 5px;
                        background: #f5f5f5;
                        text-align: center;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .document-item:hover {
                        background: #e8e8e8;
                    }
                    .document-item i {
                        font-size: 40px;
                        margin-bottom: 8px;
                        color: #555;
                    }
                    .document-item .document-name {
                        font-size: 13px;
                        word-break: break-word;
                        width: 100%;
                    }
                    .document-item .document-meta {
                        font-size: 11px;
                        color: #777;
                        margin-top: 5px;
                    }
                    .folder-info {
                        font-size: 11px;
                        color: #777;
                        margin-top: 3px;
                    }
                </style>`;
            break;
        case 'photos':
            title = 'Photos';
            content = '<div class="window-content"><p>Your photos will appear here.</p></div>';
            break;
        case 'games':
            title = 'Murder Mystery Games';
            content = `
                <div class="window-content scrollable">
                    <div class="games-container">
                        <a href="https://www.etsy.com/uk/listing/1887634120/printable-murder-mystery-game-the-final" target="_blank" class="game-icon">
                            <img src="Murder Mystery Games icons/The Final Note.png" alt="The Final Note">
                            <span>The Final Note</span>
                        </a>
                        <a href="https://www.etsy.com/uk/listing/1889219526/printable-murder-mystery-game-dead-air" target="_blank" class="game-icon">
                            <img src="Murder Mystery Games icons/Dead Air.png" alt="Dead Air">
                            <span>Dead Air</span>
                        </a>
                        <a href="https://www.etsy.com/uk/listing/4297690435/printable-murder-mystery-game-ether" target="_blank" class="game-icon">
                            <img src="Murder Mystery Games icons/Ether Station.png" alt="Ether Station">
                            <span>Ether Station</span>
                        </a>
                        <a href="https://www.etsy.com/uk/listing/4299237208/printable-murder-mystery-game-fading" target="_blank" class="game-icon">
                            <img src="Murder Mystery Games icons/Fading Minds.png" alt="Fading Minds">
                            <span>Fading Minds</span>
                        </a>
                        <a href="https://www.etsy.com/uk/listing/4301597752/printable-murder-mystery-game-faces-from" target="_blank" class="game-icon">
                            <img src="Murder Mystery Games icons/Faces from the Past.png" alt="Faces from the Past">
                            <span>Faces from the Past</span>
                        </a>
                        <a href="https://www.etsy.com/uk/listing/4303689410/printable-murder-mystery-game-secrets-of" target="_blank" class="game-icon">
                            <img src="Murder Mystery Games icons/Secrets of Stones.png" alt="Secrets of Stones">
                            <span>Secrets of Stones</span>
                        </a>
                    </div>
                </div>
            `;
            break;
        case 'audio':
            title = 'Audio Recordings';
            content = `
                <div class="window-content scrollable">
                    <h2>Audio Recordings</h2>
                    <div class="audio-player-container">
                        ${audioRecordings.map(recording => `
                            <div class="audio-item">
                                <div class="audio-info">
                                    <i class="fas fa-microphone"></i>
                                    <div class="audio-details">
                                        <span class="audio-title">${recording.title}</span>
                                        <span class="audio-meta">${recording.date} • ${recording.duration}</span>
                                    </div>
                                </div>
                                <audio controls class="audio-player">
                                    <source src="${recording.file}" type="audio/mp3">
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <style>
                    .audio-player-container {
                        padding: 10px;
                    }
                    .audio-item {
                        display: flex;
                        flex-direction: column;
                        background: #f5f5f5;
                        border-radius: 5px;
                        padding: 10px;
                        margin-bottom: 10px;
                    }
                    .audio-info {
                        display: flex;
                        align-items: center;
                        margin-bottom: 8px;
                    }
                    .audio-info i {
                        font-size: 20px;
                        margin-right: 10px;
                        color: #0078d7;
                    }
                    .audio-details {
                        display: flex;
                        flex-direction: column;
                    }
                    .audio-title {
                        font-weight: 600;
                    }
                    .audio-meta {
                        font-size: 12px;
                        color: #666;
                    }
                    .audio-player {
                        width: 100%;
                        height: 30px;
                    }
                    audio::-webkit-media-controls-panel {
                        background-color: #f5f5f5;
                    }
                </style>
            `;
            break;
        default:
            title = 'Window';
            content = '<div class="window-content"><p>Window content goes here.</p></div>';
    }
    
    // Set window HTML
    windowElement.innerHTML = `
        <div class="window-header">
            <div class="window-title">${title}</div>
            <div class="window-controls">
                <button class="window-btn minimize" onclick="minimizeWindow('${windowId}')">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="window-btn maximize" onclick="maximizeWindow('${windowId}')">
                    <i class="far fa-window-maximize"></i>
                </button>
                <button class="window-btn close" onclick="closeWindow('${windowId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        ${content}`;
    
    // Set initial position before adding to DOM
    windowElement.style.position = 'absolute';
    windowElement.style.top = '50%';
    windowElement.style.left = '50%';
    windowElement.style.transform = 'translate(-50%, -50%)';
    
    // Add window to container
    windowsContainer.appendChild(windowElement);
    
    // Make window visible after a short delay to ensure rendering
    setTimeout(() => {
        windowElement.classList.add('visible');
    }, 10);
    
    // Add to active windows
    activeWindows.push({
        id: windowId,
        element: windowElement,
        isMaximized: false,
        isMinimized: false,
        position: { x: 100 + offset, y: 100 + offset },
        size: { width: 500, height: 400 }
    });
    
    // Set initial size for games window
    if (type === 'games') {
        windowElement.style.width = '500px';
        windowElement.style.height = '400px';
    }
    
    // Show with animation
    setTimeout(() => {
        windowElement.classList.add('visible');
    }, 10);
    
    // Make window draggable
    makeDraggable(windowElement);
    
    // Bring to front on click
    windowElement.addEventListener('mousedown', () => {
        bringToFront(windowId);
    });
    
    // Simple Start Menu Toggle
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    
    // Make sure elements exist
    if (startButton && startMenu) {
        // Toggle menu on button click
        startButton.onclick = function(e) {
            e.stopPropagation();
            startMenu.classList.toggle('visible');
        };
        
        // Close menu when clicking outside
        document.onclick = function(e) {
            if (!startMenu.contains(e.target) && e.target !== startButton) {
                startMenu.classList.remove('visible');
            }
        };
        
        // Prevent menu from closing when clicking inside it
        startMenu.onclick = function(e) {
            e.stopPropagation();
        };
    }
    
    return windowElement;
}

// Initialize Start Menu
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    
    console.log('Start button:', startButton);
    console.log('Start menu:', startMenu);
    
    if (startButton && startMenu) {
        console.log('Adding event listeners for start menu');
        
        // Toggle menu on button click
        startButton.onclick = function(e) {
            console.log('Start button clicked');
            e.stopPropagation();
            startMenu.classList.toggle('visible');
        };
        
        // Close menu when clicking outside
        document.onclick = function(e) {
            if (!startMenu.contains(e.target) && e.target !== startButton) {
                console.log('Clicked outside, closing menu');
                startMenu.classList.remove('visible');
            }
        };
        
        // Prevent menu from closing when clicking inside it
        startMenu.onclick = function(e) {
            console.log('Clicked inside menu');
            e.stopPropagation();
        };
    } else {
        console.error('Could not find start button or menu');
    }
});

// Make a window draggable
function makeDraggable(element) {
    const header = element.querySelector('.window-header');
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.window-btn')) return;
        
        const windowId = element.id;
        const windowObj = activeWindows.find(w => w.id === windowId);
        
        if (windowObj.isMaximized) return;
        
        isDragging = true;
        currentWindow = element;
        
        // Calculate offset from mouse to window corner
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Prevent text selection while dragging
        e.preventDefault();
    });
}

// Handle window dragging
function handleDrag(e) {
    if (!isDragging || !currentWindow) return;
    
    const windowId = currentWindow.id;
    const windowObj = activeWindows.find(w => w.id === windowId);
    
    if (windowObj.isMaximized) {
        isDragging = false;
        return;
    }
    
    // Calculate new position
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    
    // Keep window within viewport
    const rect = currentWindow.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height - 48; // Account for taskbar
    
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    
    // Update position
    currentWindow.style.left = `${x}px`;
    currentWindow.style.top = `${y}px`;
    
    // Update window object
    if (windowObj) {
        windowObj.position = { x, y };
    }
}

// Stop dragging
function stopDragging() {
    isDragging = false;
    currentWindow = null;
}

// Close a window
function closeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (!windowElement) return;
    
    // Fade out animation
    windowElement.classList.remove('visible');
    
    // Remove from DOM after animation
    setTimeout(() => {
        windowElement.remove();
        
        // Remove from active windows
        activeWindows = activeWindows.filter(w => w.id !== windowId);
    }, 200);
}

// Minimize a window
function minimizeWindow(windowId) {
    const windowObj = activeWindows.find(w => w.id === windowId);
    if (!windowObj) return;
    
    const windowElement = document.getElementById(windowId);
    windowElement.classList.remove('visible');
    windowObj.isMinimized = true;
    
    // In a real app, you would add the window to the taskbar
}

// Maximize/restore a window
function maximizeWindow(windowId) {
    const windowObj = activeWindows.find(w => w.id === windowId);
    if (!windowObj) return;
    
    const windowElement = document.getElementById(windowId);
    
    if (windowObj.isMaximized) {
        // Restore
        windowElement.style.width = `${windowObj.size.width}px`;
        windowElement.style.height = `${windowObj.size.height}px`;
        windowElement.style.left = `${windowObj.position.x}px`;
        windowElement.style.top = `${windowObj.position.y}px`;
        windowElement.style.borderRadius = '8px';
        
        // Update maximize button icon
        const maxBtn = windowElement.querySelector('.maximize i');
        if (maxBtn) {
            maxBtn.className = 'far fa-window-maximize';
        }
    } else {
        // Save current position and size
        const rect = windowElement.getBoundingClientRect();
        windowObj.position = { x: rect.left, y: rect.top };
        windowObj.size = { width: rect.width, height: rect.height };
        
        // Maximize
        windowElement.style.width = 'calc(100% - 16px)';
        windowElement.style.height = 'calc(100% - 64px)';
        windowElement.style.left = '8px';
        windowElement.style.top = '8px';
        windowElement.style.borderRadius = '0';
        
        // Update maximize button icon
        const maxBtn = windowElement.querySelector('.maximize i');
        if (maxBtn) {
            maxBtn.className = 'far fa-window-restore';
        }
    }
    
    windowObj.isMaximized = !windowObj.isMaximized;
}

// Bring window to front
function bringToFront(windowId) {
    const windowElement = document.getElementById(windowId);
    if (!windowElement) return;
    
    // Increase z-index for the clicked window
    zIndex++;
    windowElement.style.zIndex = zIndex;
    
    // Move to end of array (for proper window stacking)
    const windowIndex = activeWindows.findIndex(w => w.id === windowId);
    if (windowIndex > -1) {
        const [windowObj] = activeWindows.splice(windowIndex, 1);
        activeWindows.push(windowObj);
    }
}

// Function to open a folder and display its contents
function openFolder(folderType) {
    const folderContents = document.getElementById('folder-contents');
    const documentsGrid = document.getElementById('documents-grid');
    const folderTitle = document.getElementById('folder-title');
    const mainView = document.querySelector('.documents-container');
    
    // Hide main view and show folder contents
    mainView.style.display = 'none';
    folderContents.style.display = 'block';
    
    // Clear previous content
    documentsGrid.innerHTML = '';
    
    // Set folder title and load appropriate content
    if (folderType === 'legal') {
        folderTitle.textContent = 'Legal Documents';
        loadDocumentsToGrid(legalDocuments);
    } else if (folderType === 'downloads') {
        folderTitle.textContent = 'Downloads';
        loadDocumentsToGrid(downloads);
    } else if (folderType === 'private') {
        folderTitle.textContent = 'Private';
        loadDocumentsToGrid(privateDocuments);
    } else {
        // Handle other folder types (archive)
        folderTitle.textContent = folderType.charAt(0).toUpperCase() + folderType.slice(1);
        documentsGrid.innerHTML = '<p>This folder is empty.</p>';
    }
    
    // Helper function to load documents into the grid
    function loadDocumentsToGrid(documents) {
        documentsGrid.innerHTML = '';
        
        if (documents.length === 0) {
            documentsGrid.innerHTML = '<p>This folder is empty.</p>';
            return;
        }
        
        documents.forEach(doc => {
            const docElement = document.createElement('div');
            docElement.className = 'document-item';
            docElement.onclick = () => viewDocument(doc);
            
            const icon = doc.type === 'image' ? 'fa-image' : 'fa-file-alt';
            
            docElement.innerHTML = `
                <i class="fas ${icon}"></i>
                <div class="document-name">${doc.title}</div>
                <div class="document-meta">${doc.date} • ${doc.size}</div>
            `;
            
            documentsGrid.appendChild(docElement);
        });
    }
}

// Function to view a document in a modal
function viewDocument(doc) {
    // Create or get the document modal
    let docModal = document.getElementById('document-modal');
    
    if (!docModal) {
        docModal = document.createElement('div');
        docModal.id = 'document-modal';
        docModal.className = 'modal';
        docModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${doc.title}</h3>
                    <button class="close-btn" onclick="closeDocumentModal()">&times;</button>
                </div>
                <div class="modal-body">
                ${doc.content === true ? 
                    `<div style="white-space: pre-wrap; font-family: 'Courier New', monospace; padding: 30px; background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 4px; max-height: 70vh; overflow-y: auto; line-height: 1.8; max-width: 700px; margin: 0 auto;">
14 January 2021

You wrote once, on the back of an envelope, "Do you even remember what you left behind?"
I didn't answer then. Maybe because I didn't want to admit I do.

I remember everything. The way you stared at that silver locket like it belonged to someone else.
The way your hands never stopped shaking, even when you said you were fine.

I kept the locket. It's in the drawer, wrapped in linen, as if hiding it could soften the truth.

---

03 June 2022

You came to the garden again. I watched from the study.
You were careful not to look up at the windows — or perhaps you knew I was there and refused to see me.

There were nine stems in the vase the day you left. You counted them, didn't you?
That was your way of saying goodbye — by taking inventory of what you never claimed.

---

26 October 2023

They think I'm changing the will for selfish reasons.
But it's not about regret. It's about correction.

You didn't grow up under my roof, but my shadow was always there.
I poisoned every room long before you ever walked into it.

---

[No Date]

I should have written this when it mattered.
But you would have torn it apart, and maybe I wanted you to.

Some wounds are easier to carry when no one offers to bandage them.

— G.
                    </div>` : 
                    doc.file.endsWith('.txt.rtf') ? 
                        `<div style="white-space: pre-wrap; font-family: monospace; padding: 15px; background: #f8f9fa; border-radius: 4px; max-height: 70vh; overflow-y: auto;">
                            [Content is encrypted or in an unsupported format]
                        </div>` : 
                        `<img src="${doc.file}" alt="${doc.title}" style="max-width: 100%; max-height: 70vh; display: block; margin: 0 auto;">`
                }
            </div>
            <div class="modal-footer">
                <span>${doc.date} • ${doc.size}</span>
            </div>
        `;
        document.body.appendChild(docModal);
    }
    
    // Update modal content if it already exists
    const modalContent = docModal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3>${doc.title}</h3>
            <button class="close-btn" onclick="closeDocumentModal()">&times;</button>
        </div>
        <div class="modal-body">
        ${doc.file.endsWith('.txt.rtf') ? 
            `<div style="white-space: pre-wrap; font-family: monospace; padding: 15px; background: #f8f9fa; border-radius: 4px; max-height: 60vh; overflow-y: auto;">
                [Content of ${doc.title} is encrypted or in an unsupported format]
            </div>` : 
            `<img src="${doc.file}" alt="${doc.title}" style="max-width: 100%; max-height: 60vh; display: block; margin: 0 auto;">`
        }
        ${doc.notes ? `<div class="document-notes">
            <p><strong>Notes:</strong> ${doc.notes}</p>
        </div>` : ''}
    </div>
    <div class="modal-footer">
        <span>${doc.date} • ${doc.size}</span>
    </div>
    `;
    
    // Show the modal
    docModal.style.display = 'flex';
    
    // Close modal when clicking outside the content
    docModal.onclick = function(event) {
        if (event.target === docModal) {
            closeDocumentModal();
        }
    };
}

// Function to close the document modal
function closeDocumentModal() {
    const docModal = document.getElementById('document-modal');
    if (docModal) {
        docModal.style.display = 'none';
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeDocumentModal();
    }
});

// Function to go back to the main documents view
function showMainView() {
    const folderContents = document.getElementById('folder-contents');
    const mainView = document.querySelector('.documents-container');
    
    folderContents.style.display = 'none';
    mainView.style.display = 'block';
}

// Initialize on load
window.onload = init;
