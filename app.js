const path = require('path');
const { app, BrowserWindow, ipcMain, Menu, MenuItem, shell } = require('electron');
const dialog = require('electron').dialog;
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const { exec } = require('child_process');

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
  
  menu.append(new MenuItem({
    label: 'File',
    submenu: [
      {
        label: 'New File',
        accelerator: 'CommandOrControl+N',
        click: () => {
          mainWindow.webContents.send('filebrowser-command', 'new_file');
        },        
      },
      {
        label: 'New Folder',
        click: () => {
          mainWindow.webContents.send('filebrowser-command', 'new_dir');
        },        
      },
      {type: 'separator'},
      {
        label: 'Open project',
        accelerator: 'CommandOrControl+O',
        click: () => {
          mainWindow.webContents.send('filebrowser-command', 'open_folder');
        },
      },
      {type: 'separator'},
      isMac ? { role: 'close' } : { role: 'quit' }
    ],
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
      {type: 'separator'},
      {
        label: 'Find',
        accelerator: 'CommandOrControl+Shift+F',
        click: () => {
          mainWindow.webContents.send('focus_finder');
        },
      },
      {type: 'separator'},
      {role: 'selectAll'},
      isDev ? {role: 'reload'} : {
        label: 'Compile',
        accelerator: 'CommandOrControl+R',
        click: () => {
          mainWindow.webContents.send('editor-keydown', KeyDown('r', ctrlKey=true));
        },
      },
    ],
    visible: true,
  }));

  menu.append(new MenuItem({
    label: "View",
    submenu: [
      {
        label: 'Zoom In',
        accelerator: 'CommandOrControl+numadd',
        click: () => {
          mainWindow.webContents.send('viewer-command', 'zoomIn');
        },
      },
      {
        label: 'Zoom Out',
        accelerator: 'CommandOrControl+numsub',
        click: () => {
          mainWindow.webContents.send('viewer-command', 'zoomOut');
        },
      },
      {
        label: 'Fit Vertically',
        // accelerator: 'CommandOrControl+Plus',
        click: () => {
          mainWindow.webContents.send('viewer-command', 'fitV');
        },
      },
      {
        label: 'Fit Horizontally',
        // accelerator: 'CommandOrControl+Plus',
        click: () => {
          mainWindow.webContents.send('viewer-command', 'fitH');
        },
      },

    ]
  }));

  menu.append(new MenuItem({role: 'windowMenu'}));

  menu.append(new MenuItem({
    label: 'Help',
    submenu: [
      {
        label: 'Documentation',
        click: () => {
          shell.openExternal('https://mbruno46.github.io/ToM/');
        }
      },
      {
        label: 'Source code',
        click: () => {
          shell.openExternal('https://github.com/mbruno46/ToM');
        }        
      },
      {type: 'separator'},
      {role: 'toggleDevTools'},
    ]
  }));
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

  document.addEventListener('keydown', event => {
    if (event.ctrlKey) {
      if (event.key=="n") {
        mainWindow.webContents.send('filebrowser-command', 'new_file');
      } else if (event.key=="o") {
        mainWindow.webContents.send('filebrowser-command', 'open_folder');
      }
      if (event.code==107) {
        mainWindow.webContents.send('viewer-command', 'zoomIn');
      } else if (event.code==109) {
        mainWindow.webContents.send('viewer-command', 'zoomOut');
      }
    }
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

ipcMain.on('fire_contextmenu', (event, name, orig, isDir, open) => {
  let contextmenu = []
  if (open) {
    if (isMac) {
      contextmenu.push({
        label: 'Preview',
        click: () => {exec(`open -a Preview ${orig}`);}
      })
      contextmenu.push({type: 'separator'});
    }
  }
  contextmenu.push({
    label: 'Rename',
    click: () => {mainWindow.webContents.send('contextmenu_rename', name);}
  })
  contextmenu.push({
    label: 'Delete',
    click: () => {mainWindow.webContents.send('contextmenu_remove', orig, isDir);}
  });

  let menu = Menu.buildFromTemplate(contextmenu);
  menu.popup();
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
    cmd = (!isDev) ? `bash ${path.join(process.resourcesPath, './scripts/macos-installer.sh')}` : 'bash ./scripts/macos-installer.sh';
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

ipcMain.on('getPlatform', (event) => {
  event.returnValue = process.platform;
})


