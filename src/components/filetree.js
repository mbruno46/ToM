const pathlib = require('path');
const fs = require('electron').remote.require('fs');

function UnixHidden(path) {
  if (path.match(/\/\.\w+$/))
    return true;
  return false;
}

class FileTree {
  constructor(path, exts, name){
    this.path = path;
    this.name = name;
    this.exts = exts;
    this.items = [];
  };

  build = () => {
    this.items = FileTree.readDir(this.path, this.exts, this.name);
  };

  static readDir(path, exts) {
    var filelist = [];

    fs.readdirSync(path).forEach(file => {
      var ext = file.substring(file.lastIndexOf('.')+1);
      if (!exts.includes(ext)) {
        return;
      }

      var tempfile = new FileTree(pathlib.join(path, file), exts, file);

      var stat = fs.statSync(tempfile.path);

      if (stat.isDirectory() && !UnixHidden(tempfile.path)){
        var name = tempfile.path.substring(tempfile.path.lastIndexOf("/")+1);
        tempfile.items = FileTree.readDir(tempfile.path, exts, name);
      };

      filelist.push(tempfile);
    });

    return filelist;
  };
};

exports.FileTree = FileTree
