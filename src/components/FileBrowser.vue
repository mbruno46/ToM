<template>
  <div class="file-tree">
    <TreeCell v-for="(value,key) in ft" 
      :key="value['path']" 
      :content="value['content']" 
      :name="key"
      :depth="value['depth']"/>
  </div>
</template>

<script>
// const {FileTree} = window.require('./modules/filetree.js');

// const fs = require('electron');//.remote.require('fs');
// import {remote} from 'electron';
// import { ipcRenderer } from "electron";
// const fs = window.require('fs');
import TreeCell from '@/components/TreeCell.vue';

// import {ref} from 'vue'
import {FileTree} from '@/hooks/filetree.js'

export default {
  components: {
    TreeCell,
  },
  setup() {
    let filetree = FileTree(["tex", "pdf"]);
    filetree.refresh("/Users/mbruno/Physics/talks/valencia_19");
    const ft = filetree.get();
    console.log(ft.value);
    return {
      ft,
    }
  },
}
</script>

<style scoped>
.file-tree {
  width: 100%;
  height: 100%;
  background-color: var(--bg0);
  flex-grow: 1;
  overflow-y: scroll;
  overflow-x: scroll;
  font-size: 0.8rem;
}
</style>