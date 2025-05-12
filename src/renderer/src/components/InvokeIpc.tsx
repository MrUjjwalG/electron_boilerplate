import { useState } from 'react'

interface InvokeIpcProps {
  inputValue: string
}

function InvokeIpc({ inputValue }: InvokeIpcProps): React.JSX.Element {
  const [invokeResponse, setInvokeResponse] = useState<string>('')

  const handleInvokeIPC = async (): Promise<void> => {
    try {
      const result = await window.electron.ipcRenderer.invoke('invoke-method', inputValue)
      setInvokeResponse(result as string)
    } catch (error) {
      setInvokeResponse(`Error: ${error}`)
    }
  }

  return (
    <div className="tab">
      <h4>Invoke Pattern</h4>
      <div className="actions">
        <div className="action">
          <button onClick={handleInvokeIPC}>Invoke Method</button>
          {invokeResponse && <div className="response">Response: {invokeResponse}</div>}
        </div>
      </div>
    </div>
  )
}

export default InvokeIpc 