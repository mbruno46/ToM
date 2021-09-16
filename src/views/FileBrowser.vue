<template>
  <Toolbar>
    <app-button icon="fa-folder-open" title="Open Folder" @click="open_folder"/>
    <app-button icon="fa-plus" title="New File"/>
    <app-button icon="fa-caret-left" title="Close browser" 
      @click="clicked"/>
  </Toolbar>
  <div class="file-tree">
    <TreeCell v-for="(value,key) in ft" 
      :key="value['path']" 
      :path="value['path']"
      :content="value['content']" 
      :name="key"
      :depth="value['depth']"
      :isDir="value['isDir']"/>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar.vue';
import AppButton from '@/components/AppButton.vue';
import TreeCell from '@/components/TreeCell.vue';
// import {FileTree} from '@/hooks/filetree.js'
import store from '@/hooks/store'
import { ref } from 'vue';
import {debouncer} from '@/hooks/utils.js';

// import {MetaData} from '@/hooks/metadata.js';
// var meta = MetaData();

const {ipcRenderer} = window.require('electron');
const fs = window.require('fs');
const pathlib = window.require('path');

function UnixHidden(path) {
  if (path.match(/\/\.\w+$/))
    return true;
  return false;
}
var exts = ["tex", "pdf", "bib"];

function readDir(path, depth=0) {
  var res = {}

  fs.readdirSync(path).forEach(file => {
    var fname = pathlib.resolve(pathlib.join(path, file));
    var _c = null;
    var isDir = false;

    if (!UnixHidden(fname)) {
      if (fs.statSync(fname).isDirectory()) {
        _c = readDir(fname, depth + 1);
        isDir = true;
      } else {
        var ext = file.substring(file.lastIndexOf('.')+1);
        if (exts.includes(ext)) {
          _c = {};
        }
      }
    }

    if ((_c!=null) && !(file in res)) {
      res[file] = {
        'path': fname,
        'content': _c,
        'depth': depth,
        'isDir': isDir,
      };
    }
  });

  return res;
}

export default {
  components: {
    TreeCell,
    Toolbar,
    AppButton
  },
  setup() {
    const ft = ref({});
    let dir = null;

    const debounce_open_folder = debouncer(_open_folder, 20);

    function _open_folder() {
      let sel = ipcRenderer.sendSync('open-folder-dialog');      

      if ((sel != null) && (dir != sel)) {
        store.editor.clean = true;
        store.editor.name = '';
        store.editor.changed = false;
        ft.value = readDir(sel);
        dir = sel;
        return
      }
      
      store.loader.value = false;
    }

    function open_folder() {
      store.loader.value = true;
      debounce_open_folder();
    }

    return {
      ft,
      open_folder,
    }
  },
  methods: {
    clicked: function() {
      store.browser.visible = false;
    },
    browser_visible() {
      return store.browser.visible;
    },
  }
}
</script>

<style scoped>
.file-tree {
  width: 100%;
  height: calc(100% - var(--toolbar-height));
  background-color: var(--bg0);
  flex-grow: 1;
  overflow-y: scroll;
  overflow-x: scroll;
  font-size: 0.8rem;
}
</style>