<template>
  <div class="panel" :style="style">
    <div v-for="(val1, key1) in layout" :key="key1" class="row">
      <span class="label" style="margin-left: 2rem">{{key1}}</span>
      <div v-for="(val2, key2) in layout[key1]" :key="key1 + '.' + key2" class="row">
        <span class="label">{{key2}}</span>
        <input class="input" :ref="key1 + '.' + key2" :value="val2" />
      </div>
    </div>

    <div class="row" style="text-align: right" >
      <app-button icon="fa-undo" title="Reset defaults" @click="reset"/>
      <app-button icon="fa-check-square" title="Apply" @click="apply"/>
      <app-button icon="fa-window-close" title="Cancel" @click="cancel"/>
    </div>

    <div class="row">
      <span class="label" style="margin-left: 2rem">Updates</span>
      <div class="row">
        <span class="label">Current version {{version}}</span>
      </div>
      <div class="row">
        <button class="btn label" @click="updater">{{update.msg}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import AppButton from '@/components/AppButton.vue';
import store from '@/hooks/store.js';
import preferences from '@/hooks/preferences.js';
const {ipcRenderer} = window.require('electron');

import { computed, ref } from '@vue/reactivity';

export default {
  components: {
    AppButton,
  },
  props: {
    style: String,
  },
  setup() {
    const layout = computed(() => {return preferences.get();})
    const update = ref({
      status: 0, 
      msg: 'Check for updates',
    });

    ipcRenderer.on('update-available', function(event, msg) {
      update.value.status = 1;
      update.value.msg = 'Install updates';
      console.log(event, msg);
    });

    ipcRenderer.on('update-not-available', function(event, msg) {
      update.value.status = 2;
      update.value.msg = 'Already up-to-date';
      console.log(event, msg);
    });

    const version = ref(ipcRenderer.sendSync('get-version'));

    return {
      layout,
      update,
      version,
    }
  },
  methods: {
    check() {
      let status = true;
      // if (!preferences.is_fontsize_supported(parseInt(this.$refs['Editor.FontSize [pt]'][0].value))) {
      //   ipcRenderer.send('error-message', 'Font size not supported');
      //   status = false;
      // }
      return status;
    },
    apply() {
      if (!this.check()) {return;}
      for (var key1 in this.layout) {
        for (var key2 in this.layout[key1]) {
          let key = `${key1}.${key2}`
          this.layout[key1][key2] = this.$refs[key][0].value;
        }
      }
      preferences.save();
      this.cancel();
    },
    cancel() {
      store.preferences.show = false;
    },
    updater() {
      if (this.update.status==0) {
        this.update.msg = 'Checking ...';
        ipcRenderer.send('check-for-updates');
      }
      else if (this.update.status==1) {
        this.update.msg = 'Downloading and installing ...'
        ipcRenderer.send('install-update');
      }
      else if (this.update.status==2) {
        this.update.status=0;
        this.update.msg = 'Check for updates';
      }
    },
    reset() {
      preferences.reset();
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
  justify-content: center;
}

.label {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.btn {
  font: inherit;
  color: inherit;
  background-color: inherit;
  border: none;
  text-decoration:none;
  outline: none;
  display: inline-block;
  align-items: center;
}
.btn:hover {
  color: var(--selected);
  background-color: var(--dark-blue);
}
.btn:active {
  color: var(--selected);
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