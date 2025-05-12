# electron_boilerplate

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## IPC Communication Examples

This application includes examples of structured IPC (Inter-Process Communication) between the renderer process (frontend) and main process (backend) in Electron:

### Asynchronous IPC

Asynchronous communication flows:
1. Renderer sends a message to main process via `ipcRenderer.send()`
2. Main process handles the message with `ipcMain.on()`
3. Main process sends a response back using `event.reply()`
4. Renderer listens for the response with `ipcRenderer.once()`

Benefits:
- Non-blocking: The renderer process continues execution while waiting for a response
- Better performance: Doesn't freeze the UI
- Good for long-running operations

### Synchronous IPC

Synchronous communication flows:
1. Renderer sends a message to main process via `ipcRenderer.sendSync()`
2. Main process handles the message with `ipcMain.on()`
3. Main process returns a value immediately using `event.returnValue`
4. Renderer receives the return value directly from the `sendSync()` call

Benefits:
- Simpler code structure
- Guarantees response before continuing execution

**Note:** Synchronous IPC should be used sparingly as it blocks the renderer process until a response is received.

### Invoke Pattern (Promise-based)

The invoke pattern provides promise-based IPC:
1. Renderer invokes a method with `ipcRenderer.invoke()`
2. Main process handles with `ipcMain.handle()`
3. Main process can return a value or a Promise
4. Renderer awaits the result with async/await

Benefits:
- Promise-based API for cleaner code
- Error handling with try/catch
- Non-blocking operation
- Structured request-response flow

### Channel-based Messaging

Channel-based communication allows organizing messages by topic:
1. Renderer sends messages to specific channels via `ipcRenderer.send()`
2. Main process listens on channel prefixes with `ipcMain.on()`
3. Main process responds on channel-specific reply channels
4. Renderer listens for responses on their specific channels

Benefits:
- Better organization of message types
- Ability to route messages to specific handlers
- Easily extendable for new features

### Broadcasting

Broadcasting allows the main process to send messages to all renderer processes:
1. Renderer can trigger broadcasts via `ipcRenderer.send()`
2. Main process sends messages to all renderers using `webContents.send()`
3. All renderer processes receive broadcasts by listening with `ipcRenderer.on()`

Benefits:
- Efficiently notify all UI components of system events
- Push notifications from main process
- Create pub/sub patterns

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
