const path = require('path');
const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron');
const dialog = require('electron').dialog;
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

const isMac = process.platform === 'darwin';
let isDev = (process.env.NODE_ENV === 'DEV');

autoUpdater.autoDownload = false
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

function KeyDown(key, ctrlKey = false, shiftKey = false) {
  return {
    ctrlKey,
    shiftKey,
    key,
  }
}

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 600,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:8080'
      : `file://${path.join(__dirname, 'index.html')}`
  );
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  var menu = Menu.buildFromTemplate([
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
  ]);

  let _submenu = [
    isMac ? { role: 'close' } : { role: 'quit' }
  ]
  if (isDev) _submenu.push({role: 'toggleDevTools'});
  _submenu.push({role: 'toggleDevTools'});
  
  menu.append(new MenuItem({
    label: 'File',
    submenu: _submenu,
    visible: true,
  }));

  menu.append(new MenuItem({
    label: "Edit",
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CommandOrControl+Z',
        click: () => {
          mainWindow.webContents.send('editor-keydown', KeyDown('z', ctrlKey=true));
        },
      },
      {
        label: 'Redo',
        accelerator: 'CommandOrControl+Shift+Z',
        click: () => {
          mainWindow.webContents.send('editor-keydown', KeyDown('z', ctrlKey=true, shiftKey=true));
        },
      },
      {type: 'separator'},
      {
        label: 'Cut',
        accelerator: 'CommandOrControl+Shift+X',
        click: () => {
          mainWindow.webContents.send('editor-keydown', KeyDown('x', ctrlKey=true));
        },
      },      
      {
        label: 'Copy',
        accelerator: 'CommandOrControl+Shift+C',
        click: () => {
          mainWindow.webContents.send('editor-keydown', KeyDown('c', ctrlKey=true));
        },
      },      
      {
        label: 'Paste',
        accelerator: 'CommandOrControl+Shift+V',
        click: () => {
          mainWindow.webContents.send('editor-keydown', KeyDown('v', ctrlKey=true));
        },
      },
      {role: 'selectAll'},
      {type: 'separator'},
      isDev ? {role: 'reload'} : {
        label: 'Compile',
        accelerator: 'CommandOrControl+R',
        click: () => {
          mainWindow.webContents.send('editor-keydown', KeyDown('r', ctrlKey=true));
        },
      },
    ],
    visible: true,
  }))

  Menu.setApplicationMenu(menu);
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
  });
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('open-folder-dialog', (event, arg) => {
  dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then((data) => {
      let dir = data.filePaths;
      event.returnValue = dir[0];
    });
});

ipcMain.on('get-userData-path', (event) => {
  event.returnValue = app.getPath("userData");
});

ipcMain.on('get-version', (event) => {
  event.returnValue = app.getVersion();
});

autoUpdater.on('update-available', (info) => {
  log.info('update is available');
  log.info(info);
  mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
  mainWindow.webContents.send('update-not-available', info);
});

ipcMain.on('check-for-updates', () => {
  autoUpdater.checkForUpdates();
  log.info('check complete');
});

ipcMain.on('install-update', () => {
  autoUpdater.downloadUpdate();
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }).then(() => {
    setImmediate(() => autoUpdater.quitAndInstall())
  });
});

autoUpdater.on('error', (error) => {
  mainWindow.webContents.send('update-not-available', error);
  // dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})




