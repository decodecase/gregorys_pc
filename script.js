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

// Open a new window
function openWindow(type) {
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
            content = '<div class="window-content"><p>Your notes will appear here.</p></div>';
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
            content = '<div class="window-content"><p>Your games will appear here.</p></div>';
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
        ${content}
    `;
    
    // Add window to container
    windowsContainer.appendChild(windowElement);
    
    // Set initial position (slightly offset for multiple windows)
    const offset = activeWindows.length * 20;
    windowElement.style.top = `${100 + offset}px`;
    windowElement.style.left = `${100 + offset}px`;
    
    // Add to active windows
    activeWindows.push({
        id: windowId,
        element: windowElement,
        isMaximized: false,
        isMinimized: false,
        position: { x: 100 + offset, y: 100 + offset },
        size: { width: 600, height: 400 }
    });
    
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
    
    return windowElement;
}

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
