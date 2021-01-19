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

exports.loadFile = loadFile;
exports.setupEditor = setupEditor;
