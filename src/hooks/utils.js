const fs = window.require('fs');

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

export function loadTexFile(fname) {
  if (fname == "") {return [""];}
  return fs.readFileSync(fname, 'utf-8').split(/\r?\n/);
}

export function saveTexFile(fname, content) {
  fs.writeFile(fname, content, 'utf-8', (err) => {
    if (err) {
      alert(`The file could not be saved\n${err}`);
    }
  });  
}

export function isMainTexFile(fname) {
  var data = fs.readFileSync(fname, 'utf-8');
  if (data.match(/^\s*(%.*)?\s*\\documentclass/)) {
    return true;
  }
  return false;
}

export default {
  getParentByAttr,
  getExtension,
  loadTexFile,
  saveTexFile,
  isMainTexFile,
}