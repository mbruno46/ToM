const fs = require('fs');
const pathlib = require('path');

class Store {
  constructor(path, fname){
    this.path = pathlib.join(path, fname + '.json');
    this.data = read();
  };

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
  }

  dump() {
    console.log(this.path);
    console.log(JSON.stringify(this.data));
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  reload() {
    this.data = read();
  }
}

function read(path) {
  if (path==null){
    return {};
  }
  return JSON.parse(fs.readFileSync(path));
}

exports.Store = Store
