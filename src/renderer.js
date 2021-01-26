const {remote, shell} = require('electron');
const path = require('path');
const fs = require('fs');
const {dialog} = remote;

// components
const {fireBrowser} = require('./components/browser.js');
const {zoom} = require('./components/viewer.js');
const {compile} = require('./components/compiler.js');
const {loadFile, saveCurrentFile, findNext} = require('./components/editor.js');
const {EditMenu} = require('./components/menu.js');
const {Store} = require('./components/store.js');
const {firePopup} = require('./components/popup.js');

// preference file
const prefs = new Store(path.join(__dirname,'../config'),'custom');
if (prefs.get('last-project') != null) {
  fireBrowser(prefs.get('last-project'), true);

}

remote.getCurrentWindow().on('close', (e) => {
  let p = document.getElementById('filetree').getAttribute("project-path");
  prefs.set('last-project',p);
  prefs.dump();
});



const open = document.getElementById('open');
open.onclick = e => {
  var dir;

  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then((data) => {
    dir = data.filePaths;
    fireBrowser(dir[0], true);
  });
};

const new_btn = document.getElementById('new');
new_btn.onclick = e => {
  let project = document.getElementById('filetree').getAttribute("project-path");
  if (project == null) {
    alert('Load a project first!')
    return;
  }
  let base = project.substring(0,project.lastIndexOf('/'));

  args = {type: 'inputText',
    defaultText: project.substring(project.lastIndexOf('/')), oktext: 'Create',
    rows: "1", cols: "40"};
  opts = {width: 'max-content', height: 48};
  let p = firePopup([120, 120], opts, args);
  document.body.append(p);

  let inputText = document.getElementById('popup-inputText');
  let ok_btn = document.getElementById('popup-ok-btn');
  ok_btn.onclick = event => {
    let newpath = base + inputText.value;
    if (!fs.existsSync(newpath)) {
      let dir = newpath.substring(0,newpath.lastIndexOf('/'));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      fs.closeSync(fs.openSync(newpath, 'w'));
      fireBrowser();
    }
    else {
      alert(`File ${newpath} already exists`);
    }
    p.parentElement.removeChild(p);    
  }
};

const fold_browser = document.getElementById('fold-browser');
const unfold_browser = document.getElementById('unfold-browser');
const browser = document.getElementById('browser');
const container = document.getElementById('container');
fold_browser.onclick = e => {
  browser.classList.add("disappear");
  container.classList.add("width-100");
  unfold_browser.classList.toggle('hide');
  fold_browser.classList.toggle('hide');
  refreshWidthViewer()
};
unfold_browser.onclick = e => {
  browser.classList.remove("disappear");
  container.classList.remove("width-100");
  unfold_browser.classList.toggle('hide');
  fold_browser.classList.toggle('hide');
  refreshWidthViewer()
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
  saveCurrentFile();
  compile();
}


const editor = document.getElementById('code-editor');
editor.onkeydown = ev => {
  // keypress ignores CTRL, etc.. so chenged makes sense here
  const fn = document.getElementById('editor-filename');
  if (fn.textContent.split('*').length == 1) {
    fn.textContent = fn.textContent + ' *';
  }
  if (ev.key == "s")
    if ((ev.ctrlKey || ev.metaKey)) {
      ev.preventDefault();
      saveCurrentFile();
    }
  if (ev.key == "r")
    if ((ev.ctrlKey || ev.metaKey)) {
      ev.preventDefault();
      saveCurrentFile();
      compile();
    }
}
editor.oncontextmenu = ev => {
  ev.preventDefault();
  const menu = EditMenu();
  menu.popup({ window: remote.getCurrentWindow() });
}

const viewer_menu_btn = document.getElementById('viewer-menu-btn');
const viewer_menu_content = document.getElementById('viewer-menu-content');
viewer_menu_btn.onclick = ev => {
  viewer_menu_content.classList.toggle('hide');
}
var i;
for (i=0;i<viewer_menu_content.children.length;i++) {
  let a = viewer_menu_content.children[i];
  a.onclick = ev => {
    if (a.hasAttribute('weblink')) {
      shell.openExternal(a.getAttribute('weblink'));
    }
    viewer_menu_content.classList.toggle('hide');
  }
}

window.onclick = function(e) {
  if (!e.target.parentElement.matches('#viewer-menu-content') &&
    !e.target.parentElement.matches('#viewer-menu-btn') &&
    !e.target.matches('#viewer-menu-btn')) {
    if (!viewer_menu_content.classList.contains('hide'))
      viewer_menu_content.classList.add('hide');
  }
}


function refreshWidthViewer() {
  let fw = document.getElementById('container').offsetWidth;
  document.getElementById('viewer').style.width = fw -
    document.getElementById('editor').offsetWidth + 'px';
}

let size = [0, 0, 0];
const resizer = document.getElementById('resizer');
resizer.onmousedown = event => {
  size[0] = document.getElementById('editor').offsetWidth;
  size[1] = document.getElementById('viewer').offsetWidth;
  size[2] = event.pageX;
}
document.onmousemove = event => {
  var diff = event.pageX - size[2];
  if (size[0]!=0 && size[1]!=0) {
    document.getElementById('editor').style.width = size[0] + diff + 'px';
    refreshWidthViewer();
  }
}
document.onmouseup = event => {
  size[0] = 0;
  size[1] = 0;
  size[2] = 0;
}

const find_btn = document.getElementById('find-btn');
const find = document.getElementById('find');
find_btn.onclick = ev => {
  findNext(find.value);
}
