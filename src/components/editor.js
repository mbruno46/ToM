const fs = require('electron').remote.require('fs');
const {SCode} = require('./scode/scode.js');
const {Codisy} = require('../codisy/codisy.js');

// let sc = SCode(document.getElementById('code-editor'));
// sc.reset();
let sc = Codisy(document.getElementById('code-editor'));
sc.reset();

const editor = document.getElementById('code-editor');
editor.oncontextmenu = ev => {
  ev.preventDefault();
  const menu = EditMenu(sc.getHistory());
  menu.popup({ window: require('electron').remote.getCurrentWindow() });
}

function loadFile(fname) {
  fs.readFile(fname, 'utf-8', (err, data) => {
      if(err){
          alert("An error ocurred reading the file :" + err.message);
          return;
      }

      if (data != "") {
        sc.setValue(data);
      }
      else {
        sc.reset();
      }
  });
}

function saveCurrentFile() {
  let data = sc.getValue();
  let fname = document.getElementById('editor-filename').getAttribute("path");
  if (fname == null) {
    if (data != "\n") {
      alert('You must select a file first from the left browser');
    }
    else {
      return;
    }
  }

  fs.writeFile(fname, data, 'utf-8', (err) => {
    if (err) {
      alert(`The file could not be saved\n${err}`);
    }
  });

  const fn = document.getElementById('editor-filename');
  fn.textContent = fn.textContent.replace(/ \*$/,"");
}

function hasDocumentClass(fname) {
  data = fs.readFileSync(fname, 'utf-8');
  if (data.match(/^\s*\\documentclass/)) {
    return true;
  }
  else {
    return false;
  }
}

function findNext(word) {
  if (word=="") {
    return;
  }
  sc.findNext(word);
}

exports.loadFile = loadFile;
exports.saveCurrentFile = saveCurrentFile;
exports.hasDocumentClass = hasDocumentClass;
exports.findNext = findNext;
