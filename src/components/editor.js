const fs = require('electron').remote.require('fs');
const {Codisy} = require('../codisy/codisy.js');
const {compile} = require('./compiler.js');

const editor = document.getElementById('code-editor');
let sc = Codisy(editor);
sc.reset(true);

editor.oncontextmenu = ev => {
  ev.preventDefault();
  const menu = EditMenu(sc.getHistory());
  menu.popup({ window: require('electron').remote.getCurrentWindow() });
}

editor.onscroll = ev => {
  let gutter = document.getElementById('gutter');
  gutter.scrollTop = editor.scrollTop;
  gutter.scrollLeft = editor.scrollLeft;
};

editor.onkeydown = ev => {
  let changed = true;
  if ((ev.ctrlKey || ev.metaKey)) {
    changed = false;
    if (ev.key == "s") {
      ev.preventDefault();
      saveCurrentFile();
    }
    if (ev.key == "r")
    {
      ev.preventDefault();
      saveCurrentFile();
      compile();
    }
  }
  if (ev.shiftKey || ev.altKey || ev.key == 'CapsLock' || ev.key == 'Escape') {changed = false;}
  if (ev.key.match(/^F[0-9]+/) || ev.key.match(/^Arrow\w+/) || ev.key.match(/^Page\w+/)) {changed = false;}

  if (changed) {
    const fn = document.getElementById('editor-filename');
    fn.textContent += (!fn.textContent.match(/\*$/) ? ' *' : '');
  }
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
