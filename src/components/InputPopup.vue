<template>
  <div :class="'popup ' + ((active) ? '': 'hidden')">
    <textarea 
      ref="textarea" class="popup-textarea" 
      rows="1" v-model="fname"
      @keydown="handleKeyDown"
    />
    <app-button icon="fa-check-circle" title="OK" @click="ok"/>
    <app-button icon="fa-ban" title="OK" @click="cancel"/>
  </div>
</template>

<script>
import AppButton from '@/components/AppButton.vue';
import utils from '@/hooks/utils.js';
import { ref } from '@vue/reactivity';

import {MetaData} from '@/hooks/metadata.js';
var meta = MetaData();
const pathlib = window.require('path');

var isDir = false;
var orig = '';

export default {
  components: {
    AppButton,
  },
  emits: ['refresh_filetree'],
  setup() {
    const fname = ref();
    const active = ref(false);

    return {
      fname,
      active,      
    }
  },
  methods: {
    activate(file = true, _orig = '') {
      this.active = true;
      this.fname = _orig;
      isDir = !file;
      orig = _orig;
    },
    ok() {
      let dst = pathlib.join(meta.getProjectDir(), this.fname);
      if (isDir) {
        if (orig == '') {
          utils.mkdir(dst);
        } else {
          utils.rename(pathlib.join(meta.getProjectDir(), orig), dst);
        }
      }
      else {
        if (!utils.getAllowedExts('latex').includes(pathlib.extname(this.fname))) {
          alert('Invalid file format');
          return;
        }
        if (orig == '') {
          utils.saveTextFile(dst, '');
        } else {
          utils.rename(pathlib.join(meta.getProjectDir(), orig), dst);
        }
      }
      this.active = false;
      this.$emit('refresh_filetree');
    },
    cancel() {
      this.active = false;
    },
    handleKeyDown: function(event) {
      if (event.key == "Enter") {event.preventDefault();}
    }
  }
}
</script>


<style scoped>
.popup {
  background-color: var(--bg0);
  border: 2px solid var(--fg);
  margin: 0;
  padding: 0.5rem;
  z-index: 4;
  position: absolute;
  left: 4rem;
  top: 6rem;
}

.popup-textarea {
  background-color: var(--bg1);
  color: var(--selected);
  border: 1px solid var(--line);
  resize: none;
  outline: none;
  vertical-align: middle;
  overflow-y: hidden;
  overflow-x: scroll;
  white-space: nowrap;
}

.popup-textarea::-webkit-scrollbar {
  display: none;
}

.hidden {
  display: none;
}

</style>