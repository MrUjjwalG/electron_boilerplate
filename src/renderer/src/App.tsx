import Versions from './components/Versions'
import IpcExamples from './components/IpcExamples'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  return (
    <div className="app-container">
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      
      <IpcExamples />

      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
      </div>
      <Versions></Versions>
    </div>
  )
}

export default App
