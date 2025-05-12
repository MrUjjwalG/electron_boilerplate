import { useState } from 'react'

interface ChannelIpcProps {
  inputValue: string
}

function ChannelIpc({ inputValue }: ChannelIpcProps): React.JSX.Element {
  const [channelResponse, setChannelResponse] = useState<string>('')
  const [channel, setChannel] = useState<string>('channel-1')

  const handleChannelMessage = (): void => {
    window.electron.ipcRenderer.send('channel-message', { channel, message: inputValue })
    window.electron.ipcRenderer.once(`${channel}-reply`, (_event, arg) => {
      setChannelResponse(arg)
    })
  }

  return (
    <div className="tab">
      <h4>Channel-based Messaging</h4>
      <div className="channel-selector">
        <select 
          value={channel} 
          onChange={(e) => setChannel(e.target.value)}
          className="channel-select"
        >
          <option value="channel-1">Channel 1</option>
          <option value="channel-2">Channel 2</option>
          <option value="channel-3">Channel 3</option>
        </select>
      </div>
      <div className="actions">
        <div className="action">
          <button onClick={handleChannelMessage}>Send to Channel</button>
          {channelResponse && <div className="response">Response: {channelResponse}</div>}
        </div>
      </div>
    </div>
  )
}

export default ChannelIpc 