import { ipcMain, IpcMainEvent, BrowserWindow } from 'electron'

// Set up broadcast timer
let broadcastInterval: NodeJS.Timeout | null = null
let broadcastCount = 0

/**
 * Handler for broadcast IPC messages
 */
export function setupBroadcastIpcHandlers(mainWindow: BrowserWindow): void {
  // Broadcast trigger
  ipcMain.on('trigger-broadcast', (event: IpcMainEvent, message: string) => {
    console.log('Broadcast triggered with:', message)
    
    // Send immediate broadcast
    mainWindow.webContents.send('broadcast-message', `Broadcast: ${message}`)
    
    // Clear any existing interval
    if (broadcastInterval) {
      clearInterval(broadcastInterval)
      broadcastCount = 0
    }
    
    // Set up timed broadcasts (3 messages)
    broadcastInterval = setInterval(() => {
      broadcastCount++
      mainWindow.webContents.send(
        'broadcast-message', 
        `Timed broadcast #${broadcastCount}: ${message}`
      )
      
      // Stop after 3 broadcasts
      if (broadcastCount >= 3) {
        if (broadcastInterval) {
          clearInterval(broadcastInterval)
          broadcastInterval = null
          broadcastCount = 0
        }
      }
    }, 2000)
  })
}

/**
 * Clean up broadcast resources
 */
export function cleanupBroadcasts(): void {
  if (broadcastInterval) {
    clearInterval(broadcastInterval)
    broadcastInterval = null
    broadcastCount = 0
  }
} 