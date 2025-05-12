import { useState, useEffect } from 'react'

interface MultiWindowIpcProps {
  inputValue: string
}

function MultiWindowIpc({ inputValue }: MultiWindowIpcProps): React.JSX.Element {
  const [windowStatus, setWindowStatus] = useState<string>('No child window')
  const [receivedMessages, setReceivedMessages] = useState<string[]>([])

  // Listen for messages from other windows
  useEffect(() => {
    const cleanup = window.electron.ipcRenderer.on('window-message', (_event, message) => {
      setReceivedMessages(prev => [...prev, message])
    })

    // Clean up listener when component unmounts
    return () => {
      cleanup()
    }
  }, [])

  // Open a new window
  const openNewWindow = (): void => {
    window.electron.ipcRenderer.send('open-new-window')
    setWindowStatus('Opening child window...')
    
    // Listen for window open confirmation
    window.electron.ipcRenderer.once('window-opened', () => {
      setWindowStatus('Child window is open')
    })
  }

  // Send message to other windows
  const sendToAllWindows = (): void => {
    if (inputValue.trim() === '') {
      setWindowStatus('Please enter a message to send')
      return
    }
    
    window.electron.ipcRenderer.send('send-to-all-windows', inputValue)
  }

  // Close all child windows
  const closeAllWindows = (): void => {
    window.electron.ipcRenderer.send('close-all-windows')
    setWindowStatus('Closing all child windows')
    
    // Reset status after a delay
    setTimeout(() => {
      setWindowStatus('No child window')
    }, 1000)
  }

  // Clear received messages
  const clearMessages = (): void => {
    setReceivedMessages([])
  }

  return (
    <div className="tab">
      <h4>Multi-Window Communication</h4>
      <div className="actions multi-window-actions">
        <div className="action-row">
          <button onClick={openNewWindow}>Open New Window</button>
          <button onClick={sendToAllWindows}>Send To All Windows</button>
          <button onClick={closeAllWindows}>Close All Windows</button>
          <button onClick={clearMessages} className="clear-button">Clear Messages</button>
        </div>
        <div className="window-status">{windowStatus}</div>
      </div>
      
      <div className="broadcast-messages">
        {receivedMessages.length > 0 ? (
          receivedMessages.map((msg, index) => (
            <div key={index} className="broadcast-message">
              {msg}
            </div>
          ))
        ) : (
          <div className="no-messages">No messages from other windows</div>
        )}
      </div>
    </div>
  )
}

export default MultiWindowIpc 