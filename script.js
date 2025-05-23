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
const PASSWORD = '1234';

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
            content = '<div class="window-content"><p>Your documents will appear here.</p></div>';
            break;
        case 'photos':
            title = 'Photos';
            content = '<div class="window-content"><p>Your photos will appear here.</p></div>';
            break;
        case 'games':
            title = 'Murder Mystery Games';
            content = `
                <div class="window-content">
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
                </div>`;
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

// Initialize on load
window.onload = init;
