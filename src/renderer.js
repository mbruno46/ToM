//import FileTree from './filetree'
const {dialog} = require('electron').remote;
//const {FileTree} = require('filetree')
// import {fireBrowser} from './filetree';
// const {fireBrowser} = require('./filetree.js');

// var codemirror = CodeMirror.fromTextArea(document.getElementById('editor'), {
//   lineNumbers: true,
//   mode: "stex",
//   inMathMode: true,
//   smartIndent: true,
// });

// fires up browser with current working directory
const app = require('electron').remote.app;
//fireBrowser(app.getAppPath());
fireBrowser("/Users/mbruno/Physics/talks/valencia_19");

setViewerPDF("/Users/mbruno/Physics/talks/soton_20/soton20-bruno.pdf");
refreshViewer();

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