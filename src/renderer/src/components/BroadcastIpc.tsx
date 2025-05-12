import { useState, useEffect } from 'react'

interface BroadcastIpcProps {
  inputValue: string
}

function BroadcastIpc({ inputValue }: BroadcastIpcProps): React.JSX.Element {
  const [broadcastMessages, setBroadcastMessages] = useState<string[]>([])

  // Listen for broadcasts when component mounts
  useEffect(() => {
    const cleanup = window.electron.ipcRenderer.on('broadcast-message', (_event, message) => {
      setBroadcastMessages(prev => [...prev, message])
    })

    // Clean up listener when component unmounts
    return () => {
      cleanup()
    }
  }, [])

  // Trigger broadcast
  const handleBroadcast = (): void => {
    window.electron.ipcRenderer.send('trigger-broadcast', inputValue)
  }

  // Clear broadcast messages
  const clearBroadcastMessages = (): void => {
    setBroadcastMessages([])
  }

  return (
    <div className="tab">
      <h4>Broadcast</h4>
      <div className="actions">
        <div className="action">
          <button onClick={handleBroadcast}>Trigger Broadcast</button>
          <button onClick={clearBroadcastMessages} className="clear-button">Clear</button>
        </div>
      </div>
      <div className="broadcast-messages">
        {broadcastMessages.length > 0 ? (
          broadcastMessages.map((msg, index) => (
            <div key={index} className="broadcast-message">
              {msg}
            </div>
          ))
        ) : (
          <div className="no-messages">No broadcast messages</div>
        )}
      </div>
    </div>
  )
}

export default BroadcastIpc 