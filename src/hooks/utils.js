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

export default {
  getParentByAttr,
  getExtension,
  loadTexFile,
}