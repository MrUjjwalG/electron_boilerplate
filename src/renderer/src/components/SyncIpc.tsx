import { useState } from 'react'

interface SyncIpcProps {
  inputValue: string
}

function SyncIpc({ inputValue }: SyncIpcProps): React.JSX.Element {
  const [syncResponse, setSyncResponse] = useState<string>('')

  const handleSyncIPC = (): void => {
    // Invoke sync method and get immediate result
    const result = window.electron.ipcRenderer.sendSync('sync-message', inputValue)
    setSyncResponse(result as string)
  }

  return (
    <div className="tab">
      <h4>Sync IPC</h4>
      <div className="actions">
        <div className="action">
          <button onClick={handleSyncIPC}>Send Sync IPC</button>
          {syncResponse && <div className="response">Response: {syncResponse}</div>}
        </div>
      </div>
    </div>
  )
}

export default SyncIpc 