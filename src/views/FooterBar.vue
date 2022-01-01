<template>
  <tool-bar>
    <div class="vert" style="padding: 0 1rem;">
      <input ref="word" class="finder" placeholder="find"/>
      <app-button icon="fa-search" title="Find" @click="find"/>
    </div>
    <div class="vert" style="position: absolute; right: 0;">
      <loading-throbber />
      <app-button icon="fa-cog" title="Settings" style="float: right" @click="open_pref"/>
    </div>
  </tool-bar>
</template>

<script>
import ToolBar from '@/components/ToolBar.vue';
import AppButton from '../components/AppButton.vue';
import LoadingThrobber from '../components/LoadingThrobber.vue';
import store from '@/hooks/store.js';

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
    open_pref() {
      store.preferences.show = true;
    }
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
  color: var(--selected);
}

.vert {
  align-items: center;
  display: flex;
  height: 100%;
}
</style>