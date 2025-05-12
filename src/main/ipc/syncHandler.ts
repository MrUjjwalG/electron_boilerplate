import { ipcMain, IpcMainEvent } from 'electron'

/**
 * Handler for synchronous IPC messages
 */
export function setupSyncIpcHandlers(): void {
  // Synchronous message handler
  ipcMain.on('sync-message', (event: IpcMainEvent, arg: string) => {
    console.log('Received sync message:', arg)
    
    // Process synchronously
    const result = `Sync processed: ${arg} (immediate response)`
    
    // Send result synchronously - this blocks until the renderer processes it
    event.returnValue = result
  })
} 