import { ipcMain, IpcMainInvokeEvent } from 'electron'

/**
 * Handler for invoke IPC pattern
 */
export function setupInvokeIpcHandlers(): void {
  // Invoke pattern handler
  ipcMain.handle('invoke-method', async (_event: IpcMainInvokeEvent, arg: string) => {
    console.log('Invoke method called with:', arg)
    
    // Simulate async processing with Promise
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Invoke processed: ${arg} (promise-based)`)
      }, 800)
    })
  })
} 