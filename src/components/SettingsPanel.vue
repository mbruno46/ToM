<template>
  <div class="panel">
    <div class="row">
      <span class="label" style="margin-left: 2rem">LaTeX</span>
    </div>
    <div class="row">
      <span class="label">Command</span>
      <input class="input" :value="prefs.latex.cmd" />
    </div>
    <div class="row">
      <span class="label">Options</span>
      <input class="input" :value="prefs.latex.opts" />
    </div>
    <div class="row">
      <app-button icon="fa-window-close" title="Cancel" style="float: right" @click="cancel"/>
      <app-button icon="fa-check-square" title="Apply" style="float: right" />
    </div>
  </div>
</template>

<script>
import AppButton from '../components/AppButton.vue';
import store from '@/hooks/store.js';

import { computed } from '@vue/reactivity';

export default {
  components: {
    AppButton,
  },
  setup() {
    const prefs = computed(() => {return store.preferences;})

    console.log(prefs);

    return {
      prefs
    }
  },
  methods: {
    cancel() {
      store.preferences.show = false;
    }
  }
}
</script>

<style scoped>
.panel {
  font-family: 'Source Code Pro', monospace;
  font-size: 1rem;
  color: var(--selected);
  background-color: var(--bg1);
  /* outline: none; */
  /* text-align: left; */
  white-space: nowrap;
  caret-color: var(--selected);
  padding-right: 4rem;
  display: flex;
  flex-flow: column;
}

.row {
  width: 100%;
  margin: 0.5rem 0 0.5rem 0;
}

.label {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.input {
  font: inherit;
  color: inherit;
  background-color: var(--bg1);
  width: 100%;
  outline: none;
  border: 2px solid var(--line);
  resize: none;
  vertical-align: middle;
  overflow-y: hidden;
  overflow-x: auto;
}

</style>