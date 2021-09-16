import utils from '@/hooks/utils.js';
const pathlib = window.require('path');
const fs = window.require('fs');

var meta = {dir: '', main: '', inputs: [], files: []};

// fundamental facts: \input is always full path relative to main
//   \include cannot be nested, ie only in main file

// want a regex like /\\label{(.*?)}/g
function extractor(re, text, callback) {
  console.log(re, text, text.match(re));
  let m = text.match(re);
  if (m) {
    m.forEach(e => {
      e.split(re)[1].match(/[^,]+/g).forEach(ee => {
        callback(ee);
      })
    })
  }
}


var usable_exts = [".tex",".bib",".pdf",".eps",".jpg",".png"];
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
  var parse_input = false;

  function init(main_file) {
    meta = {};
    meta.main = pathlib.basename(main_file);
    meta.dir = pathlib.resolve(pathlib.dirname(main_file)) + '/';
    meta.inputs = [];
    meta.files = finder(meta.dir);
    addInput(meta.main);
  }

  function addInput(path) {
    console.log('adding ', path)
    var name = pathlib.basename(path);
    if (!(name in meta)) {
      meta.inputs.push(name);
      meta[name] = {
        reldir: pathlib.dirname(path),
        lines: [],
        bibrefs: [],
      }
    } 
    if (parse_input) parseFile(name);
  }

  function parseFile(name) {
    if (pathlib.extname(name) == ".tex") {
      parseTeXFile(name);
    } else if (pathlib.extname(name) == ".bib") {
      parseBibFile(name);
    }
  }

  function parseTeXFile(name) {
    let lines = utils.loadTextFile(pathlib.join(meta.dir, meta[name].reldir, name));
    meta[name].lines = [];
    lines.forEach((l,i) => {
      meta[name].lines.push(newLine());
      parseTeXLine(name, i, l);
    });
  }

  function parseTeXLine(name, idx, text) {
    var isMain = name == meta.main;
    let line = meta[name].lines[idx];
    extractor(new RegExp(`\\input{(.*?)}`,'g'), text, (e)=>{addInput(e);});
    if (isMain) {
      extractor(new RegExp(`\\include{(.*?)}`,'g'), text, (e)=>{addInput(e);});
    }
    extractor(new RegExp(`\\bibliography{(.*?)}`,'g'), text, (e)=>{addInput(e);});
    extractor(new RegExp(`\\label{(.*?)}`,'g'), text, (e)=>{line.labels.push(e);});
  }

  function parseBibFile(name) {
    let lines = utils.loadTextFile(pathlib.join(meta.dir, meta[name].reldir, name));
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
    set_recursive(r) {
      parse_input = r;
    },
    parse() {
      parse_input = true;
      parseTeXFile(meta.main);
      parse_input = false;
    },
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