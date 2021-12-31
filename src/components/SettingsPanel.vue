<template>
  <div class="panel" >
    <div v-for="(val1, key1) in layout" :key="key1" class="row">
      <span class="label" style="margin-left: 2rem">{{key1}}</span>
      <div v-for="(val2, key2) in layout[key1]" :key="key1 + '.' + key2" class="row">
        <span class="label">{{key2}}</span>
        <input class="input" :ref="key1 + '.' + key2" :value="val2" />
      </div>
    </div>

    <div class="row">
      <app-button icon="fa-window-close" title="Cancel" style="float: right" @click="cancel"/>
      <app-button icon="fa-check-square" title="Apply" style="float: right" @click="apply"/>
    </div>
  </div>
</template>

<script>
import AppButton from '../components/AppButton.vue';
import store from '@/hooks/store.js';
import preferences from '@/hooks/preferences.js';

import { computed } from '@vue/reactivity';

export default {
  components: {
    AppButton,
  },
  setup() {
    const layout = computed(() => {return preferences.get();})

    return {
      layout,
    }
  },
  methods: {
    apply() {
      for (var key1 in this.layout) {
        for (var key2 in this.layout[key1]) {
          let key = `${key1}.${key2}`
          this.layout[key1][key2] = this.$refs[key].value;          
        }
      }
      preferences.save();
      this.cancel();
    },
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