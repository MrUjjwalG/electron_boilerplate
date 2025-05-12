import { ipcMain, BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

// Track all child windows
const childWindows: BrowserWindow[] = []

/**
 * Creates and returns a new browser window
 */
function createChildWindow(parentWindow: BrowserWindow): BrowserWindow {
  // Get parent window position
  const parentBounds = parentWindow.getBounds()
  
  // Get screen size
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  
  // Create a new browser window
  const childWindow = new BrowserWindow({
    width: 600,
    height: 500,
    x: Math.min(parentBounds.x + 50, width - 600),
    y: Math.min(parentBounds.y + 50, height - 500),
    title: 'Child Window',
    parent: parentWindow,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  
  // Load the same content as the main window
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    childWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    childWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  
  // Add to tracking array
  childWindows.push(childWindow)
  
  // Remove from tracking array when closed
  childWindow.on('closed', () => {
    const index = childWindows.indexOf(childWindow)
    if (index !== -1) {
      childWindows.splice(index, 1)
    }
  })
  
  return childWindow
}

/**
 * Sends a message to all windows (main and child)
 */
function sendToAllWindows(message: string, senderWindow?: BrowserWindow): void {
  // Get all windows including the main window
  const allWindows = BrowserWindow.getAllWindows()
  
  // Send to each window
  allWindows.forEach(window => {
    // Don't send back to sender
    if (senderWindow && window.id === senderWindow.id) {
      return
    }
    
    if (!window.isDestroyed()) {
      window.webContents.send('window-message', message)
    }
  })
}

/**
 * Close all child windows
 */
function closeAllChildWindows(): void {
  // Make a copy of the array since we'll be modifying it during iteration
  [...childWindows].forEach(window => {
    if (!window.isDestroyed()) {
      window.close()
    }
  })
  
  // Clear the array
  childWindows.length = 0
}

/**
 * Set up handlers for multi-window IPC
 */
export function setupMultiWindowIpcHandlers(): void {
  // Handler for opening a new window
  ipcMain.on('open-new-window', (event) => {
    // Find the sender window
    const senderWindow = BrowserWindow.fromWebContents(event.sender)
    if (!senderWindow) return
    
    // Create a child window
    const childWindow = createChildWindow(senderWindow)
    
    // Notify the sender that the window was opened
    event.reply('window-opened')
    
    // Inform other windows about the new window
    const message = `New window opened (id: ${childWindow.id})`
    sendToAllWindows(message, senderWindow)
  })
  
  // Handler for sending a message to all windows
  ipcMain.on('send-to-all-windows', (event, message) => {
    // Find the sender window
    const senderWindow = BrowserWindow.fromWebContents(event.sender)
    if (!senderWindow) return
    
    // Format the message with window ID
    const formattedMessage = `Window ${senderWindow.id}: ${message}`
    
    // Send to all other windows
    sendToAllWindows(formattedMessage, senderWindow)
  })
  
  // Handler for closing all child windows
  ipcMain.on('close-all-windows', () => {
    closeAllChildWindows()
  })
}

/**
 * Clean up resources used by multi-window handlers
 */
export function cleanupMultiWindowHandlers(): void {
  closeAllChildWindows()
} 