const { app, BrowserWindow, Menu, MenuItem} = require('electron');
const path = require('path');
const {Preferences} = require('./components/preferences.js');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const isMac = process.platform === 'darwin'

const createWindow = () => {
  const prefs = new Preferences(__dirname,'user-preferences');
  let size = prefs.get('size');
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: size[0],
    minWidth: 800,
    height: size[1],
    minHeight: 400,
    // useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('close', function() {
    mainWindow.webContents.send('save-user-preferences', {
      size: mainWindow.getSize()
    });
  });

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
      isMac ? { role: 'close' } : { role: 'quit' }
    ],
    visible: false,
  }));

  menu.append(new MenuItem({
    label: "Edit",
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'selectAll'}
    ],
    visible: false,
  }))

  Menu.setApplicationMenu(menu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
