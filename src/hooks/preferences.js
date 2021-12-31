const { reactive } = require("vue");
const {ipcRenderer} = window.require('electron');
const fs = window.require('fs');
const pathlib = window.require('path');
import store from '@/hooks/store.js';

let file = pathlib.join(ipcRenderer.sendSync('get-userData-path'), 'preferences.dat');

let defaults = {
  'LaTeX': {
    'Command': 'latexmk -pdf',
    'Options': ' -silent -gg',
  },
  'Autosave': {
    'Interval [ms]': 5000,
  }
}

function refresh() {
  store.preferences.autosave = parseInt(preferences['Autosave']['Interval [ms]']);
}

if (fs.existsSync(file)) {
  defaults = JSON.parse(fs.readFileSync(file, {encoding: "utf8"}));
}
const preferences = reactive({});
for (var key in defaults) {
  preferences[key] = defaults[key];
}
refresh();

export function get() {
  return preferences;
}

export function save() {
  fs.writeFileSync(file, JSON.stringify(preferences, null, '\t'));
  refresh();
}

export default {
  get,
  save,
}