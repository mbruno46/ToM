const path = require('path');
const { app, BrowserWindow, ipcMain, Menu, globalShortcut } = require('electron');
const dialog = require('electron').dialog;
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const { exec } = require('child_process');

const menu = require('./menu');

const isMac = process.platform === 'darwin';
let isDev = (process.env.NODE_ENV === 'DEV');

autoUpdater.autoDownload = false
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

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

  Menu.setApplicationMenu(menu.appMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
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

ipcMain.on('error-message', (event, error) => {
  dialog.showErrorBox('Error: ', error == null ? "unknown" : error)
});

ipcMain.on('get-version', (event) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('fire_helpmenu', () => {
  menu.helpMenu.popup();
});

ipcMain.on('fire_contextmenu', (event, name, orig, isDir, open) => {
  let contextmenu = []
  if (open) {
    contextmenu.push({
      label: 'Preview',
      click: () => {mainWindow.webContents.send('contextmenu_preview', orig);}
    });
    contextmenu.push({type: 'separator'});
  }
  contextmenu.push({
    label: 'Rename',
    click: () => {mainWindow.webContents.send('contextmenu_rename', name);}
  })
  contextmenu.push({
    label: 'Delete',
    click: () => {mainWindow.webContents.send('contextmenu_remove', orig, isDir);}
  });

  let m = Menu.buildFromTemplate(contextmenu);
  m.popup();
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

autoUpdater.on('error', (error) => {
  mainWindow.webContents.send('update-not-available', error);
  // dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})

ipcMain.on('install-update', () => {
  if (isMac) {
    cmd = (!isDev) ? `bash ${path.join(process.resourcesPath, './scripts/installer.sh')} zip` : 'bash ./scripts/installer.sh zip';
    var child = exec(cmd, {env: {
      ...process.env
    }}, (err, stdout, stderr) => {
      log.info(stdout);
      if (err != null) {
        log.error(stderr);
        return;
      } 
    });
        
    child.on('close', () => {

      dialog.showMessageBox({
        title: 'Updates installed',
        message: 'Application will be quit'
      }).then(() => {
        setImmediate(() => app.quit());
      });
    })
  } else {
    autoUpdater.downloadUpdate();
  }
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }).then(() => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

ipcMain.on('get-platform', (event) => {
  event.returnValue = process.platform;
});
