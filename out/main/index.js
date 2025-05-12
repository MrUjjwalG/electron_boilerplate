"use strict";
const electron = require("electron");
const path = require("path");
const is = {
  dev: !electron.app.isPackaged
};
const platform = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
};
const electronApp = {
  setAppUserModelId(id) {
    if (platform.isWindows)
      electron.app.setAppUserModelId(is.dev ? process.execPath : id);
  },
  setAutoLaunch(auto) {
    if (platform.isLinux)
      return false;
    const isOpenAtLogin = () => {
      return electron.app.getLoginItemSettings().openAtLogin;
    };
    if (isOpenAtLogin() !== auto) {
      electron.app.setLoginItemSettings({ openAtLogin: auto });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },
  skipProxy() {
    return electron.session.defaultSession.setProxy({ mode: "direct" });
  }
};
const optimizer = {
  watchWindowShortcuts(window, shortcutOptions) {
    if (!window)
      return;
    const { webContents } = window;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
    webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        if (!is.dev) {
          if (input.code === "KeyR" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "KeyI" && (input.alt && input.meta || input.control && input.shift)) {
            event.preventDefault();
          }
        } else {
          if (input.code === "F12") {
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({ mode: "undocked" });
              console.log("Open dev tool...");
            }
          }
        }
        if (escToCloseWindow) {
          if (input.code === "Escape" && input.key !== "Process") {
            window.close();
            event.preventDefault();
          }
        }
        if (!zoom) {
          if (input.code === "Minus" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "Equal" && input.shift && (input.control || input.meta))
            event.preventDefault();
        }
      }
    });
  },
  registerFramelessWindowIpc() {
    electron.ipcMain.on("win:invoke", (event, action) => {
      const win = electron.BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (action === "show") {
          win.show();
        } else if (action === "showInactive") {
          win.showInactive();
        } else if (action === "min") {
          win.minimize();
        } else if (action === "max") {
          const isMaximized = win.isMaximized();
          if (isMaximized) {
            win.unmaximize();
          } else {
            win.maximize();
          }
        } else if (action === "close") {
          win.close();
        }
      }
    });
  }
};
const icon = path.join(__dirname, "../../resources/icon.png");
function setupAsyncIpcHandlers() {
  electron.ipcMain.on("async-message", (event, arg) => {
    console.log("Received async message:", arg);
    setTimeout(() => {
      event.reply("async-reply", `Async processed: ${arg} (delayed response)`);
    }, 1e3);
  });
}
function setupSyncIpcHandlers() {
  electron.ipcMain.on("sync-message", (event, arg) => {
    console.log("Received sync message:", arg);
    const result = `Sync processed: ${arg} (immediate response)`;
    event.returnValue = result;
  });
}
function setupInvokeIpcHandlers() {
  electron.ipcMain.handle("invoke-method", async (_event, arg) => {
    console.log("Invoke method called with:", arg);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Invoke processed: ${arg} (promise-based)`);
      }, 800);
    });
  });
}
function setupChannelIpcHandlers() {
  electron.ipcMain.on("channel-message", (event, data) => {
    console.log(`Received message on ${data.channel}:`, data.message);
    let response;
    switch (data.channel) {
      case "channel-1":
        response = `Channel 1 processed: ${data.message} (priority channel)`;
        break;
      case "channel-2":
        response = `Channel 2 processed: ${data.message} (secondary channel)`;
        break;
      case "channel-3":
        response = `Channel 3 processed: ${data.message} (fallback channel)`;
        break;
      default:
        response = `Unknown channel: ${data.message}`;
    }
    event.reply(`${data.channel}-reply`, response);
  });
}
let broadcastInterval = null;
let broadcastCount = 0;
function setupBroadcastIpcHandlers(mainWindow) {
  electron.ipcMain.on("trigger-broadcast", (event, message) => {
    console.log("Broadcast triggered with:", message);
    mainWindow.webContents.send("broadcast-message", `Broadcast: ${message}`);
    if (broadcastInterval) {
      clearInterval(broadcastInterval);
      broadcastCount = 0;
    }
    broadcastInterval = setInterval(() => {
      broadcastCount++;
      mainWindow.webContents.send(
        "broadcast-message",
        `Timed broadcast #${broadcastCount}: ${message}`
      );
      if (broadcastCount >= 3) {
        if (broadcastInterval) {
          clearInterval(broadcastInterval);
          broadcastInterval = null;
          broadcastCount = 0;
        }
      }
    }, 2e3);
  });
}
function cleanupBroadcasts() {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
    broadcastCount = 0;
  }
}
const childWindows = [];
function createChildWindow(parentWindow) {
  const parentBounds = parentWindow.getBounds();
  const primaryDisplay = electron.screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const childWindow = new electron.BrowserWindow({
    width: 600,
    height: 500,
    x: Math.min(parentBounds.x + 50, width - 600),
    y: Math.min(parentBounds.y + 50, height - 500),
    title: "Child Window",
    parent: parentWindow,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    childWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    childWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  childWindows.push(childWindow);
  childWindow.on("closed", () => {
    const index = childWindows.indexOf(childWindow);
    if (index !== -1) {
      childWindows.splice(index, 1);
    }
  });
  return childWindow;
}
function sendToAllWindows(message, senderWindow) {
  const allWindows = electron.BrowserWindow.getAllWindows();
  allWindows.forEach((window) => {
    if (senderWindow && window.id === senderWindow.id) {
      return;
    }
    if (!window.isDestroyed()) {
      window.webContents.send("window-message", message);
    }
  });
}
function closeAllChildWindows() {
  [...childWindows].forEach((window) => {
    if (!window.isDestroyed()) {
      window.close();
    }
  });
  childWindows.length = 0;
}
function setupMultiWindowIpcHandlers() {
  electron.ipcMain.on("open-new-window", (event) => {
    const senderWindow = electron.BrowserWindow.fromWebContents(event.sender);
    if (!senderWindow) return;
    const childWindow = createChildWindow(senderWindow);
    event.reply("window-opened");
    const message = `New window opened (id: ${childWindow.id})`;
    sendToAllWindows(message, senderWindow);
  });
  electron.ipcMain.on("send-to-all-windows", (event, message) => {
    const senderWindow = electron.BrowserWindow.fromWebContents(event.sender);
    if (!senderWindow) return;
    const formattedMessage = `Window ${senderWindow.id}: ${message}`;
    sendToAllWindows(formattedMessage, senderWindow);
  });
  electron.ipcMain.on("close-all-windows", () => {
    closeAllChildWindows();
  });
}
function cleanupMultiWindowHandlers() {
  closeAllChildWindows();
}
function setupIpcHandlers(mainWindow) {
  setupAsyncIpcHandlers();
  setupSyncIpcHandlers();
  setupInvokeIpcHandlers();
  setupChannelIpcHandlers();
  setupBroadcastIpcHandlers(mainWindow);
  setupMultiWindowIpcHandlers();
  console.log("Setting up IPC handlers");
}
function cleanupIpcHandlers() {
  cleanupBroadcasts();
  cleanupMultiWindowHandlers();
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return mainWindow;
}
electron.app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  const mainWindow = createWindow();
  setupIpcHandlers(mainWindow);
  electron.ipcMain.on("ping", () => console.log("pong"));
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  cleanupIpcHandlers();
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
