const path = require('path');
const { app, BrowserWindow } = require('electron');

let isDev = (process.env.NODE_ENV === 'DEV');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:8080'
      : `file://${process.cwd()}/dist/index.html`
  );
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// const electron = require('electron')
// const app = electron.app
// const BrowserWindow = electron.BrowserWindow

// let url
// if (process.env.NODE_ENV === 'DEV') {
//   url = 'http://localhost:8080/'
// } else {
//   url = `file://${process.cwd()}/dist/index.html`
// }

// app.on('ready', () => {
//   let window = new BrowserWindow({
//     width: 800, 
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//       nodeIntegrationInWorker: true,
//       enableRemoteModule: true,
//     }
//   })
//   window.loadURL(url);
//   window.webContents.openDevTools();
// })