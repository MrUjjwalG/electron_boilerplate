import { useState } from 'react'
import AsyncIpc from './AsyncIpc'
import SyncIpc from './SyncIpc'
import InvokeIpc from './InvokeIpc'
import ChannelIpc from './ChannelIpc'
import BroadcastIpc from './BroadcastIpc'
import MultiWindowIpc from './MultiWindowIpc'

function IpcExamples(): React.JSX.Element {
  const [inputValue, setInputValue] = useState<string>('')

  return (
    <div className="ipc-example">
      <h3>IPC Communication Examples</h3>
      <input 
        type="text" 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter message to send"
      />
      
      <div className="tabs">
        <AsyncIpc inputValue={inputValue} />
        <SyncIpc inputValue={inputValue} />
        <InvokeIpc inputValue={inputValue} />
        <ChannelIpc inputValue={inputValue} />
        <BroadcastIpc inputValue={inputValue} />
        <MultiWindowIpc inputValue={inputValue} />
      </div>
    </div>
  )
}

export default IpcExamples 