const fs = window.require('fs');
const pathlib = window.require('path');
const { exec } = window.require('child_process');

const {ipcRenderer} = window.require('electron');
export var platform = ipcRenderer.sendSync('get-platform');

import store from '@/hooks/store.js';

export function getParentByAttr(element, attr) {
  if (element.hasAttribute(attr)) {
    return element
  } else {
    return getParentByAttr(element.parentElement, attr)
  }
}

export function getExtension(file) {
  return file.substring(file.lastIndexOf('.')+1);
}

export function getName(path) {
  return pathlib.basename(path);
}

export function loadTextFile(fname) {
  if (fname == "") {return [""];}
  return fs.readFileSync(fname, 'utf-8').split(/\r?\n/);
}

export function saveTextFile(fname, content) {
  fs.writeFileSync(fname, content, 'utf-8');
}

export function mkdir(dir) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function mv(src, dst) {
  let name = pathlib.basename(src);
  fs.rename(src, pathlib.join(dst, name), function (err) {
    if (err) throw err
  });
}

export function rename(src, dst) {
  fs.rename(src, dst, function (err) {
    if (err) throw err
  });
}

export function remove(src, isDir) {
  if (isDir) {
    fs.rmdir(src, {recursive: true}, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } else {
    fs.unlink(src, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
}

export function exists(src) {
  return fs.existsSync(src);
}

export function resolve_path(p) {
  return pathlib.resolve(p);
}

export function terminal(cmd, callback = ()=>{}) {
  var precmd = ''
  if (platform == 'darwin') {
    precmd += "eval $(/usr/libexec/path_helper);"
    precmd += "if [ -f $HOME/.bash_profile ]; then source $HOME/.bash_profile$HOME/.bash_profile; fi;"
  }
  console.log(platform, precmd)
  exec(`${precmd} ${cmd}`, {
    env: {
      ...process.env
    }
  }, (err, stdout, stderr) => {
    callback(err, stdout, stderr);
  });
}

export function isMainTexFile(fname) {
  var data = fs.readFileSync(fname, 'utf-8');
  if (data.match(/^\s*(%.*)?\s*\\documentclass/)) {
    return true;
  }
  return false;
}

export function compileTex(basename, callback = ()=>{}, callback_err = ()=>{}) {
  var workdir = basename.substring(0,basename.lastIndexOf('/'));
  var cmd = `cd ${workdir}; ${store.preferences.latex.cmd} ${store.preferences.latex.opts} ${basename}.tex`;
  terminal(cmd, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (err != null) {
      let log = `${basename}.log`;
      let msg = [stderr, '\n', '\n'];
      if (fs.existsSync(log)) {
        msg = msg.concat(loadTextFile(`${basename}.log`));
      }
      callback_err(msg);
    } else {
      callback();
    }
  });
}

export function debouncer(callback, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args); 
    }, timeout);
  };
}

export function appendAtIndex(parent, child, index) {
  if (!index) index = 0
  if ((index<0) || (index >= parent.children.length)) {
    parent.appendChild(child)
  } else {
    parent.insertBefore(child, parent.children[index])
  }
}

export function deleteAtIndex(parent, index) {
  if (!index) index = 0
  if ((index<0) || (index >= parent.children.length)) {
    parent.lastChild.remove();
  } else {
    parent.removeChild(parent.children[index]);
  }
}

export function getIndexOf(arr, el) {
  return Array.prototype.indexOf.call(arr, el);
}

export function getAllowedExts(key='all') {
  // files that can be edited
  var latex_exts = [".tex",".bib"];
  // files that can't be edited but it's useful to visualize in browser
  var figure_exts = [".pdf",".eps",".png","jpg"];
  if (key=='latex') return latex_exts;
  if (key=="figure") return figure_exts;
  return latex_exts.concat(figure_exts);
}

export function copyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default {
  getParentByAttr,
  getExtension,
  getName,
  loadTextFile,
  saveTextFile,
  mkdir,
  mv,
  rename,
  remove,
  exists,
  resolve_path,
  isMainTexFile,
  compileTex,
  debouncer,
  appendAtIndex,
  deleteAtIndex,
  getIndexOf,
  getAllowedExts,
  copyObject,
}