const pathlib = require('path');
const fs = require('electron').remote.require('fs');

class FileTree {
  constructor(path, name = null){
    this.path = path;
    this.name = name;
    this.items = [];
  };

  build = () => {
    this.items = FileTree.readDir(this.path);
  };

  static readDir(path) {
    var filelist = [];

    fs.readdirSync(path).forEach(file => {
      var tempfile = new FileTree(pathlib.join(path, file), file);

      var stat = fs.statSync(tempfile.path);

      if (stat.isDirectory()){
          tempfile.items = FileTree.readDir(tempfile.path);
      };

      filelist.push(tempfile);
    });

    return filelist;
  };
};

exports.FileTree = FileTree
