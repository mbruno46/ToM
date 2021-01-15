const fs = require('electron').remote.require('fs');

var editor = ace.edit("editor-inner");

function setupEditor() {
  editor.setTheme("ace/theme/dracula");
  editor.session.setMode("ace/mode/latex");
  
};

function loadFile(fname) {
  fs.readFile(fname, 'utf-8', (err, data) => {
      if(err){
          alert("An error ocurred reading the file :" + err.message);
          return;
      }

      editor.setValue(data);
  });
}

exports.loadFile = loadFile;
exports.setupEditor = setupEditor;
