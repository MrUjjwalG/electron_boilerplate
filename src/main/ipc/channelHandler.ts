import { ipcMain, IpcMainEvent } from 'electron'

interface ChannelData {
  channel: string
  message: string
}

/**
 * Handler for channel-based IPC messages
 */
export function setupChannelIpcHandlers(): void {
  // Channel-based messaging
  ipcMain.on('channel-message', (event: IpcMainEvent, data: ChannelData) => {
    console.log(`Received message on ${data.channel}:`, data.message)
    
    // Process based on channel
    let response: string
    
    switch (data.channel) {
      case 'channel-1':
        response = `Channel 1 processed: ${data.message} (priority channel)`
        break
      case 'channel-2':
        response = `Channel 2 processed: ${data.message} (secondary channel)`
        break
      case 'channel-3':
        response = `Channel 3 processed: ${data.message} (fallback channel)`
        break
      default:
        response = `Unknown channel: ${data.message}`
    }
    
    // Reply on the specific channel
    event.reply(`${data.channel}-reply`, response)
  })
} 