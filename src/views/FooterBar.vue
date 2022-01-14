<template>
  <tool-bar>
    <div class="vert">
      <app-icon icon="fa-code-branch" 
        :color="(git.status==1) ? 'var(--red)' : 'var(--green)'"
        :text="git.branch"/>
    </div>
    <div class="vert" style="padding: 0 1rem;">
      <input ref="word" class="finder" placeholder="find"/>
      <app-button icon="fa-search" title="Find" @click="find"/>
    </div>
    <div class="vert" style="position: absolute; right: 0;">
      <loading-throbber />
      <app-button icon="fa-cog" title="Settings" :style="'float: right;'" @click="toggle_pref"/>
    </div>
  </tool-bar>
</template>

<script>
import ToolBar from '@/components/ToolBar.vue';
import AppButton from '../components/AppButton.vue';
import AppIcon from '@/components/AppIcon.vue';
import LoadingThrobber from '../components/LoadingThrobber.vue';
import store from '@/hooks/store.js';
import { reactive } from '@vue/reactivity';
import utils from '@/hooks/utils.js';
import { watchEffect } from '@vue/runtime-core';

const {ipcRenderer} = window.require('electron');

import {MetaData} from '@/hooks/metadata.js';
var meta = MetaData();

export default {
  components: {
    ToolBar,
    AppButton,
    LoadingThrobber,
    AppIcon,
  },
  emits: ['find'],
  setup() {
    const git = reactive({active: false, status: 0, branch: 'no git'});

    function parse_git_status(err, stdout, stderr) {
      if (err == null) {
        git.active = true;
        git.status = 0;
        git.branch = 'no git';
        stdout.split(/\r?\n/).forEach(line => {
          if (line.substring(0,2) == '##') {
            let tmp = line.match(/##\s(.*)\.\.\..*/);
            git.branch = tmp[1];
          }
          if (line.match(/\sM\s.*/)) {git.status=1;} 
        });
      } else {
        console.log(stderr);
      }

      console.log(git);
    }

    watchEffect(()=>{
      if (store.viewer.basepath != '') {
        utils.terminal(`cd ${meta.getProjectDir()}; git status --porcelain -b`, parse_git_status);
      }
    });
    watchEffect(()=>{
      if (store.editor.changed) {
        if (git.active) {git.status==1;}
      }
    });

    return {
      git,
    }
  },
  methods: {
    find() {
      this.$emit('find',this.$refs.word.value);
    },
    toggle_pref() {
      store.preferences.show = !store.preferences.show;
    },
  },
  mounted() {
    ipcRenderer.on('focus_finder', () => {
      this.$refs.word.focus();
    });
  }
}
</script>

<style scoped>
.finder {
  font-family: 'Source Code Pro', monospace;
  font-size: 1rem;
  color: var(--fg);
  background-color: var(--bg1);
  width: 100%;
  outline: none;
  border: 2px solid var(--line);
  resize: none;
  vertical-align: middle;
  white-space: nowrap;
  overflow-y: hidden;
  overflow-x: auto;
}

.finder:focus {
  /* border: 2px solid var(--dark-blue); */
  background-color: var(--dark-blue);
  color: var(--selected);
}

.vert {
  align-items: center;
  display: flex;
  height: 100%;
}
</style>