const { reactive } = require("vue");
const {ipcRenderer} = window.require('electron');
const fs = window.require('fs');
const pathlib = window.require('path');
import store from '@/hooks/store.js';
import {platform} from '@/hooks/utils.js';

let file = pathlib.join(ipcRenderer.sendSync('get-userData-path'), 'preferences.dat');

let defaults = {
  'LaTeX': {
    'Command': 'latexmk -pdf',
    'Options': ' -silent -gg -synctex=-1',
  },
  'Editor': {
    'FontSize [pt]': 12,
  },
  'Preview': {
    'Command': (platform === 'darwin') ? 'Open -a Preview' : 'okular',
  },
  'Autosave': {
    'Interval [ms]': 5000,
  }
}
let userpref = {};

function refresh() {
  store.preferences.autosave = parseInt(preferences['Autosave']['Interval [ms]']);
  store.preferences.fontsize = parseInt(preferences['Editor']['FontSize [pt]']);
  store.preferences.latex = {
    cmd: preferences['LaTeX']['Command'], 
    opts: preferences['LaTeX']['Options']
  };
  store.preferences.preview = preferences['Preview']['Command'];
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

export function reset() {
  for (var key in defaults) {
    preferences[key] = defaults[key];
  }
}

export default {
  get,
  save,
  reset
}