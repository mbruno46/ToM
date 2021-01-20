const {remote} = require('electron');
const {dialog} = remote;

const {fireBrowser} = require('./components/browser.js');

// fires up browser with current working directory
//fireBrowser(app.getAppPath());
fireBrowser("/Users/mbruno/Physics/jura/dummy");

const {zoom} = require('./components/viewer.js');

//setViewerPDF("/Users/mbruno/Physics/talks/soton_20/soton20-bruno.pdf");
//refreshViewer();

const {compile} = require('./components/compiler.js');

const {setupEditor, loadFile, saveCurrentFile} = require('./components/editor.js');
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

const fold_browser = document.getElementById('fold-browser');
const unfold_browser = document.getElementById('unfold-browser');
const browser = document.getElementById('browser');
const container = document.getElementById('container');
fold_browser.onclick = e => {
  browser.classList.add("disappear");
  container.classList.add("width-100");
};

unfold_browser.onclick = e => {
  browser.classList.remove("disappear");
  container.classList.remove("width-100");
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
  save();
  compile();
}

function save() {
  saveCurrentFile();
  const fn = document.getElementById('editor-filename');
  fn.textContent = fn.textContent.replace(" *","");
}

const editor = document.getElementById('code-editor');
editor.onkeypress = ev => {
  if (ev.defaultPrevented)
    return;
  // keypress ignores CTRL, etc.. so chenged makes sense here
  const fn = document.getElementById('editor-filename');
  if (fn.textContent.split('*').length == 1) {
    fn.textContent = fn.textContent + ' *';
  }
}
