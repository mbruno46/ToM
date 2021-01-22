const fs = require('electron').remote.require('fs');
const {SimpleCode} = require('./simplecode/simplecode.js');

// var editor = ace.edit("editor-inner");
//
// function setupEditor() {
//   editor.setTheme("ace/theme/dracula");
//   editor.session.setMode("ace/mode/latex");
//
// };

// var editor = document.getElementById('code-editor');

let sc = SimpleCode(document.getElementById('code-editor'));

function setupEditor() {
  return;
};

function loadFile(fname) {
  fs.readFile(fname, 'utf-8', (err, data) => {
      if(err){
          alert("An error ocurred reading the file :" + err.message);
          return;
      }

      sc.setValue(data);
  });
}

function saveCurrentFile() {
  let data = sc.getValue();
  let fname = document.getElementById('editor-filename').getAttribute("path");
  if (fname == null) {alert('You must select a file first from the left browser');}

  fs.writeFile(fname, data, 'utf-8', (err) => {
    if (err) {
      alert(`The file could not be saved\n${err}`);
    }
  });
}

exports.loadFile = loadFile;
exports.setupEditor = setupEditor;
exports.saveCurrentFile = saveCurrentFile;
