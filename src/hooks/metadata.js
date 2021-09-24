import utils from '@/hooks/utils.js';
const pathlib = window.require('path');
const fs = window.require('fs');

var meta = {dir: '', inputs: [], files: []};

// fundamental facts: \input is always full path relative to main
//   \include cannot be nested, ie only in main file

// want a regex like /\\label{(.*?)}/g
function extractor(re, text, callback) {
  let m = text.match(re);
  if (m) {
    m.forEach(e => {
      e.split(re)[1].match(/[^,]+/g).forEach(ee => {
        callback(ee);
      })
    })
  }
}


var usable_exts = utils.getAllowedExts();
function finder(dir, files_){
  files_ = files_ || [];
  var files = fs.readdirSync(dir);
  for (var i in files) {
    var name = pathlib.join(dir, files[i]);
    if (fs.statSync(name).isDirectory()){
      finder(name, files_);
    } else {
      if (usable_exts.includes(pathlib.extname(name))) files_.push(name);
    }
  }
  return files_;
}

export function MetaData() {

  function init(project_dir) {
    meta = {};
    meta.dir = pathlib.resolve(project_dir) + '/';
    meta.files = finder(meta.dir);
    meta.inputs = [];
    meta.files.forEach(f => {
      if (utils.getAllowedExts('latex').includes(pathlib.extname(f))) {
        addInput(f.substring(meta.dir.length));
      }
    });
  }

  function addInput(path) {
    var name = pathlib.basename(path);
    if (!(name in meta)) {
      meta.inputs.push(name);
      meta[name] = {
        reldir: pathlib.dirname(path),
        lines: [],
        bibrefs: [],
      }
    }
    parseFile(name);
  }

  function parseFile(name) {
    if (pathlib.extname(name) == ".tex") {
      parseTeXFile(name);
    } else if (pathlib.extname(name) == ".bib") {
      parseBibFile(name);
    }
  }

  function parseTeXFile(name) {
    let lines = utils.loadTextFile(pathlib.join(meta.dir, meta[name].reldir, name), true);
    meta[name].lines = [];
    lines.forEach((l,i) => {
      meta[name].lines.push(newLine());
      parseTeXLine(name, i, l);
    });
  }

  function parseTeXLine(name, idx, text) {
    let line = newLine();
    extractor(new RegExp(`\\label{(.*?)}`,'g'), text, (e)=>{line.labels.push(e);});
    meta[name].lines[idx] = line;
  }

  function parseBibFile(name) {
    let lines = utils.loadTextFile(pathlib.join(meta.dir, meta[name].reldir, name), true);
    meta[name].bibrefs = [];
    lines.forEach(l => {
      extractor(new RegExp(`@article{(.*?),`,'g'), l, (e)=>{meta[name].bibrefs.push(e);});
    });
  }

  function newLine() {
    return {
      labels: [],
    }
  }

  return {
    init,
    parseFile,
    parseTeXLine,
    getAllLabels() {
      console.log(meta);
      let labels = [];
      meta.inputs.forEach(input => {
        meta[input].lines.forEach(line => {
          line.labels.forEach(label => {
            labels.push(label);
          });
        });
      });
      return labels;
    },
    getAllFiles(exts) {
      // return files.filter(f => pathlib.extname(f) == ext);
      var r = [];
      meta.files.forEach(f => {
        console.log(f);
        if (exts.includes(pathlib.extname(f))) {
          r.push(f.substring(meta.dir.length));
        }
      });
      return r;
    },
    getAllBibReferences() {
      let r = [];
      meta.inputs.forEach(input => {
        meta[input].bibrefs.forEach(ref => {
          r.push(ref);
        });
      });
      return r;
    }
  }
}