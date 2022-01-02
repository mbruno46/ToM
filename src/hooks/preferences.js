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
  'Editor': {
    'FontSize [pt]': 12,
  },
  'Autosave': {
    'Interval [ms]': 5000,
  }
}
let userpref = {};

function refresh() {
  store.preferences.autosave = parseInt(preferences['Autosave']['Interval [ms]']);
  store.preferences.fontsize = parseInt(preferences['Editor']['FontSize [pt]']);
}

if (fs.existsSync(file)) {
  userpref = JSON.parse(fs.readFileSync(file, {encoding: "utf8"}));
}
const preferences = reactive({});
for (var key in defaults) {
  preferences[key] = (key in userpref) ? userpref[key] : defaults[key];
}
refresh();

export function get() {
  return preferences;
}

export function save() {
  console.log(preferences);
  fs.writeFileSync(file, JSON.stringify(preferences, null, '\t'));
  refresh();
}

function is_fontsize_supported(size) {
  return [10, 12, 14, 18].includes(size);
}

export default {
  get,
  save,
  is_fontsize_supported,
}