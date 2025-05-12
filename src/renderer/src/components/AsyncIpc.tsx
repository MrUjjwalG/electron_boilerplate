import { useState } from 'react'

interface AsyncIpcProps {
  inputValue: string
}

function AsyncIpc({ inputValue }: AsyncIpcProps): React.JSX.Element {
  const [asyncResponse, setAsyncResponse] = useState<string>('')

  const handleAsyncIPC = (): void => {
    // Send data to main process and handle response
    window.electron.ipcRenderer.send('async-message', inputValue)
    window.electron.ipcRenderer.once('async-reply', (_event, arg) => {
      setAsyncResponse(arg)
    })
  }

  return (
    <div className="tab">
      <h4>Basic Async IPC</h4>
      <div className="actions">
        <div className="action">
          <button onClick={handleAsyncIPC}>Send Async IPC</button>
          {asyncResponse && <div className="response">Response: {asyncResponse}</div>}
        </div>
      </div>
    </div>
  )
}

export default AsyncIpc 