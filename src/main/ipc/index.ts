import { BrowserWindow } from 'electron'
import { setupAsyncIpcHandlers } from './asyncHandler'
import { setupSyncIpcHandlers } from './syncHandler'
import { setupInvokeIpcHandlers } from './invokeHandler'
import { setupChannelIpcHandlers } from './channelHandler'
import { setupBroadcastIpcHandlers, cleanupBroadcasts } from './broadcastHandler'
import { setupMultiWindowIpcHandlers, cleanupMultiWindowHandlers } from './multiWindowHandler'

/**
 * Set up all IPC handlers
 */
export function setupIpcHandlers(mainWindow: BrowserWindow): void {
  // Set up individual handlers
  setupAsyncIpcHandlers()
  setupSyncIpcHandlers()
  setupInvokeIpcHandlers()
  setupChannelIpcHandlers()
  setupBroadcastIpcHandlers(mainWindow)
  setupMultiWindowIpcHandlers()

  // IPC test - legacy handler
  console.log('Setting up IPC handlers')
}

/**
 * Clean up any resources used by IPC handlers
 */
export function cleanupIpcHandlers(): void {
  cleanupBroadcasts()
  cleanupMultiWindowHandlers()
} 