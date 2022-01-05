const { app, Menu, MenuItem, shell } = require('electron');

const isMac = process.platform === 'darwin';
let isDev = (process.env.NODE_ENV === 'DEV');

const template = [
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
];

template.push(new MenuItem({
  label: 'File',
  submenu: [
    {
      label: 'New File',
      accelerator: 'CommandOrControl+N',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('filebrowser-command', 'new_file');
      },        
    },
    {
      label: 'New Folder',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('filebrowser-command', 'new_dir');
      },        
    },
    {type: 'separator'},
    {
      label: 'Open project',
      accelerator: 'CommandOrControl+O',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('filebrowser-command', 'open_folder');
      },
    },
    {type: 'separator'},
    isMac ? { role: 'close' } : { role: 'quit' }
  ],
  visible: true,
}));


template.push(new MenuItem({
  label: "Edit",
  submenu: [
    {
      label: 'Undo',
      accelerator: 'CommandOrControl+Z',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('editor-keydown', KeyDown('z', ctrlKey=true));
      },
    },
    {
      label: 'Redo',
      accelerator: 'CommandOrControl+Shift+Z',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('editor-keydown', KeyDown('z', ctrlKey=true, shiftKey=true));
      },
    },
    {type: 'separator'},
    {
      label: 'Cut',
      accelerator: 'CommandOrControl+Shift+X',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('editor-keydown', KeyDown('x', ctrlKey=true));
      },
    },      
    {
      label: 'Copy',
      accelerator: 'CommandOrControl+Shift+C',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('editor-keydown', KeyDown('c', ctrlKey=true));
      },
    },
    {
      label: 'Paste',
      accelerator: 'CommandOrControl+Shift+V',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('editor-keydown', KeyDown('v', ctrlKey=true));
      },
    },
    {type: 'separator'},
    {
      label: 'Find',
      accelerator: 'CommandOrControl+Shift+F',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('focus_finder');
      },
    },
    {type: 'separator'},
    {role: 'selectAll'},
    isDev ? {role: 'reload'} : {
      label: 'Compile',
      accelerator: 'CommandOrControl+R',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('editor-keydown', KeyDown('r', ctrlKey=true));
      },
    },
  ],
  visible: true,
}));


template.push(new MenuItem({
  label: "View",
  submenu: [
    {
      label: 'Zoom In',
      accelerator: 'CommandOrControl+numadd',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('viewer-command', 'zoomIn');
      },
    },
    {
      label: 'Zoom Out',
      accelerator: 'CommandOrControl+numsub',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('viewer-command', 'zoomOut');
      },
    },
    {
      label: 'Fit Vertically',
      // accelerator: 'CommandOrControl+Plus',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('viewer-command', 'fitV');
      },
    },
    {
      label: 'Fit Horizontally',
      // accelerator: 'CommandOrControl+Plus',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('viewer-command', 'fitH');
      },
    },

  ]
}));


template.push(new MenuItem({role: 'windowMenu'}));

let helpmenu = [
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
  {
    label: 'LaTeX documentation',
    click: () => {
      shell.openExternal('https://www.latex-project.org/help/documentation/');
    }        
  },
  {
    label: 'LaTeX Wikibook',
    click: () => {
      shell.openExternal('https://en.wikibooks.org/wiki/LaTeX');
    }
  }
];

template.push(new MenuItem({
  id: 'help',
  label: 'Help',
  submenu: helpmenu.concat([
    {type: 'separator'},
    {role: 'toggleDevTools'},
  ])
}));

module.exports.appMenu = Menu.buildFromTemplate(template);
module.exports.helpMenu = Menu.buildFromTemplate(helpmenu);