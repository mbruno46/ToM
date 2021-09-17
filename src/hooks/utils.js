const fs = window.require('fs');
const { exec } = window.require('child_process');

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

export function loadTextFile(fname) {
  if (fname == "") {return [""];}
  return fs.readFileSync(fname, 'utf-8').split(/\r?\n/);
}

export function saveTextFile(fname, content) {
  fs.writeFileSync(fname, content, 'utf-8');
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
  var cmd = `cd ${workdir}; latexmk -pdf -silent -g ${basename}.tex`;
  
  exec(cmd, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (err != null) {
      callback_err(loadTextFile(`${basename}.log`));
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

export default {
  getParentByAttr,
  getExtension,
  loadTextFile,
  saveTextFile,
  isMainTexFile,
  compileTex,
  debouncer,
  appendAtIndex,
  getIndexOf,
  getAllowedExts,
}