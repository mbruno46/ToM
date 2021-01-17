function firePreview(file) {
  const remote = require('electron').remote;
  const BrowserWindow = remote.BrowserWindow;
  const win = new BrowserWindow({
    height: 600,
    width: 800
  });

  win.loadURL(`file://${__dirname}/preview.html`);
}

exports.firePreview = firePreview
