<template>
  <tool-bar>
    <div class="vert" style="padding: 0 1rem;">
      <input ref="word" class="finder" placeholder="find"/>
      <app-button icon="fa-search" title="Find" @click="find"/>
    </div>
    <div class="vert">
      <app-button icon="fa-exchange-alt" title="Sync"/>
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
import LoadingThrobber from '../components/LoadingThrobber.vue';
import store from '@/hooks/store.js';

const {ipcRenderer} = window.require('electron');

export default {
  components: {
    ToolBar,
    AppButton,
    LoadingThrobber,
  },
  emits: ['find'],
  setup() {
  },
  methods: {
    find() {
      this.$emit('find',this.$refs.word.value);
    },
    toggle_pref() {
      store.preferences.show = !store.preferences.show;
    }
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