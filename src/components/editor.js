const fs = require('electron').remote.require('fs');
const {SimpleCode} = require('./simplecode/simplecode.js');

let sc = SimpleCode(document.getElementById('code-editor'));

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
  if (fname == null) {alert('You must select a file first from the left browser');}

  fs.writeFile(fname, data, 'utf-8', (err) => {
    if (err) {
      alert(`The file could not be saved\n${err}`);
    }
  });

  const fn = document.getElementById('editor-filename');
  fn.textContent = fn.textContent.replace(/ \*$/,"");
}

function hasDocumentClass(file) {
  fs.readFile(fname, 'utf-8', (err, data) => {
      if(err){
          alert("An error ocurred reading the file :" + err.message);
          return;
      }

      if (data.match(/^\s*\\documentclass/gm)) {return true;}
  });
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
