<template>
  <tool-bar>
    <app-button icon="fa-folder-open" title="Open Folder" @click="open_folder"/>
    <app-button icon="fa-folder-plus" title="New Folder" @click="new_dir"/>
    <app-button icon="fa-plus" title="New File" @click="new_file"/>
    <app-button icon="fa-sync-alt" title="Refresh" @click="reload"/>
    <app-button icon="fa-caret-left" title="Hide browser" 
      :style="'position: absolute; right: 0'"
      @click="clicked"/>
  </tool-bar>
  <div class="file-tree"
    @mousemove="moveMiniCell">
    <TreeCell v-for="(value,key) in ft" 
      :key="value['path']"
      :path="value['path']"
      :content="value['content']" 
      :name="key"
      :depth="value['depth']"
      :isDir="value['isDir']"
      @rename="rename(value['path'])"
      @remove="remove(value['path'],value['isDir'])"
    />
  </div>
  <input-popup ref="input_popup" @refresh_filetree="reload"/>
  <mini-cell :x="minicell.x" :y="minicell.y"/>
  <div class="tbar">
    <app-icon icon="fa-code-branch"
      :color="git.color"
      :text="git.branch"/>  
  </div>
</template>

<script>
import ToolBar from '@/components/ToolBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppButton from '@/components/AppButton.vue';
import TreeCell from '@/components/TreeCell.vue';
import InputPopup from '@/components/InputPopup.vue';
import store from '@/hooks/store'
import { remove, terminal, debouncer } from '@/hooks/utils';
import { ref, reactive, watchEffect } from 'vue';

import {MetaData} from '@/hooks/metadata.js';
import MiniCell from '@/components/MiniCell.vue';
var meta = MetaData();

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
    ToolBar,
    AppButton,
    AppIcon,
    InputPopup,
    MiniCell,
  },
  setup() {
    const ft = ref({});
    const minicell = ref({x:0, y:0});
    let dir = null;
    const git = reactive({active: false, status: 0, branch: 'no git'});
    
    function check_git_status() {
      function parse_git_status(err, stdout, stderr) {
        git.color = 'var(--text)'
        if (err == null) {
          git.active = true;
          git.color = 'var(--green)';
          git.branch = 'no git';
          stdout.split(/\r?\n/).forEach(line => {
            if (line.substring(0,2) == '##') {
              let tmp = line.match(/##\s(.*)\.\.\..*/);
              git.branch = tmp[1];
            }
            if (line.match(/\sM\s.*/)) {git.color='var(--red)';} 
          });
        } else {
          console.log(stderr);
        }
      }

      terminal(`cd ${meta.getProjectDir()}; git status --porcelain -b`, parse_git_status);
    }

    const debounce_open_folder = debouncer(_open_folder, 20);

    function _open_folder() {
      let sel = ipcRenderer.sendSync('open-folder-dialog');      

      if ((sel != null) && (dir != sel)) {
        store.reset_editor();
        store.reset_viewer();
        ft.value = readDir(sel);
        dir = sel;
        meta.init(dir);
        return
      }
      
      store.loader.value = false;
    }

    function open_folder() {
      store.loader.value = true;
      debounce_open_folder();
    }

    function reload() {
      if (dir!=null) {
        ft.value = readDir(dir);
        meta.init(dir);
        check_git_status();
      }
    }

    watchEffect(()=>{
      if (store.browser.selected.path=='#moved#') reload();
    })
    watchEffect(()=>{
      if (store.viewer.basepath != '') {check_git_status();}
    });
    watchEffect(()=>{
      if (store.editor.changed) {
        if (git.active) {git.status==1;}
      }
    });

    return {
      ft,
      open_folder,
      reload,
      minicell,
      git,
    }
  },
  methods: {
    clicked: function() {
      store.browser.visible = false;
    },
    browser_visible() {
      return store.browser.visible;
    },
    new_file() {
      this.$refs.input_popup.activate(true);
    },
    new_dir() {
      this.$refs.input_popup.activate(false);
    },
    moveMiniCell(event) {
      if (store.browser.moving > 0) {
        store.browser.moving = 2;
        this.minicell.x = event.clientX;
        this.minicell.y = event.clientY;
      } 
    },
  },
  mounted() {
    ipcRenderer.on('filebrowser-command', (event, key) => {
      console.log(event);
      this[key]();
    });
    ipcRenderer.on('contextmenu_preview', (_, arg) => {
      console.log('preview',store.preferences.preview,arg);
      terminal(`${store.preferences.preview} ${arg}`);
    });
    ipcRenderer.on('contextmenu_rename', (_, arg) => {
      store.reset_editor();
      this.$refs.input_popup.activate(true, arg);
    });
    ipcRenderer.on('contextmenu_remove', (_, orig, isDir) => {
      store.reset_editor();
      remove(orig, isDir);
      this.reload();
    });
    ipcRenderer.on('contextmenu_setmain', (_, main) => {
      store.viewer.basepath = main;
    });
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

.tbar {
  background-color: var(--bg0);
  width: 100%;
  /* height: var(--toolbar-height); */
}
</style>