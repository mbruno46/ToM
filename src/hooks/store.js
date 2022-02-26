import { reactive, ref } from 'vue';

const editor = reactive({
  read: true, 
  path: '', 
  previous: '',
  name: '', 
  changed: false, 
  clean: false
});

const browser = reactive({
  visible: true, 
  moving: 0, 
  selected: {
    path: '',
    name: ''
  }
});

const viewer = reactive({basepath: '', aspect_ratio: 1, refresh: false});
const loader = ref(false);
const preferences = reactive({show: false, autosave: 0, fontsize: 12, latex: {}});

function editor_load(path, name) {
  editor.read = true;
  editor.previous = editor.path;
  editor.path = path;
  editor.name = name;
  editor.changed = false;
  editor.clean = true;
}

function reset_editor() {
  editor.read = true;
  editor.path = '';
  editor.name = '';
  editor.previous = '';
  editor.changed = false;
  editor.clean = true;
}

function reset_viewer() {
  viewer.basepath = '';
  viewer.aspect_ratio = 1;
  viewer.refresh = false;
}

export default {
  editor,
  browser,
  viewer,
  loader,
  preferences,
  reset_editor,
  editor_load,
  reset_viewer,
}