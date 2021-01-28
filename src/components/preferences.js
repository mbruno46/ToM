const fs = require('fs');
const pathlib = require('path');

class Preferences {
  constructor(path, fname){
    this.path = pathlib.join(path, fname + '.json');
    this.data = read(this.path);
  };

  get(key) {
    if (this.data[key].value == null) {
      return this.data[key].default;
    }
    return this.data[key].value;
  }

  set(key, value) {
    this.data[key].value = value;
  }

  dump() {
    console.log(this.path);
    console.log(JSON.stringify(this.data));
    fs.writeFileSync(this.path, JSON.stringify(this.data,'',2));
  }

  reload() {
    this.data = read(this.path);
  }
}

function read(path) {
  if (path==null){
    return {};
  }
  return JSON.parse(fs.readFileSync(path));
}

exports.Preferences = Preferences;
