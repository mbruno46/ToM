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

export function loadTexFile(fname) {
  if (fname == "") {return [""];}
  return fs.readFileSync(fname, 'utf-8').split(/\r?\n/);
}

export function saveTexFile(fname, content) {
  // fs.writeFile(fname, content, 'utf-8', (err) => {
  //   if (err) {
  //     alert(`The file could not be saved\n${err}`);
  //   }
  // });  
  fs.writeFileSync(fname, content, 'utf-8');
}

export function isMainTexFile(fname) {
  var data = fs.readFileSync(fname, 'utf-8');
  if (data.match(/^\s*(%.*)?\s*\\documentclass/)) {
    return true;
  }
  return false;
}

export function compileTex(basename, callback) {
  var workdir = basename.substring(0,basename.lastIndexOf('/'));
  var cmd = `cd ${workdir}; latexmk -pdf -silent -g ${basename}.tex`;
  exec(cmd, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (err != null) {
      console.log(err);
    } else {
      callback();
    }
  });
}

export default {
  getParentByAttr,
  getExtension,
  loadTexFile,
  saveTexFile,
  isMainTexFile,
  compileTex,
}