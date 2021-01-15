const {remote} = require('electron');
const {dialog} = remote;

const {fireBrowser} = require('./components/browser.js');

// fires up browser with current working directory
//fireBrowser(app.getAppPath());
fireBrowser("/Users/mbruno/Physics/talks/valencia_19");

const {setViewerPDF, refreshViewer, zoom} = require('./components/viewer.js');

setViewerPDF("/Users/mbruno/Physics/talks/soton_20/soton20-bruno.pdf");
refreshViewer();

const {compile} = require('./components/compiler.js');

const {setupEditor} = require('./components/editor.js');
setupEditor();

const open = document.getElementById('open');
open.onclick = e => {
  var dir;

  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then((data) => {
    dir = data.filePaths;
    fireBrowser(dir[0]);
  });
};

const zoom_in = document.getElementById('zoom_in');
zoom_in.onclick = ev => {
  zoom(+1);
}

const zoom_out = document.getElementById('zoom_out');
zoom_out.onclick = ev => {
  zoom(-1);
}

const compile_btn = document.getElementById('compile');
compile_btn.onclick = ev => {
  compile();
}
