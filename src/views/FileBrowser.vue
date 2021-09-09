<template>
  <Toolbar>
    <app-button icon="fa-folder-open" title="Open Folder"/>
    <app-button icon="fa-caret-left" title="Close browser" 
      :style="'position: absolute; right: 0; top: ' + (browser_visible() ? '0':'-100')"
      @click="clicked"/>
  </Toolbar>
  <div class="file-tree">
    <TreeCell v-for="(value,key) in ft" 
      :key="value['path']" 
      :path="value['path']"
      :content="value['content']" 
      :name="key"
      :depth="value['depth']"/>
  </div>
</template>
      :style="'visibility: ' + (browser_visible() ? 'visible' : 'hidden')"

<script>
import Toolbar from '@/components/Toolbar.vue';
import AppButton from '@/components/AppButton.vue';
import TreeCell from '@/components/TreeCell.vue';
import {FileTree} from '@/hooks/filetree.js'
import store from '@/hooks/store'

export default {
  components: {
    TreeCell,
    Toolbar,
    AppButton
  },
  setup() {
    let filetree = FileTree(["tex", "pdf"]);
    filetree.refresh("/Users/mbruno/Physics/talks/valencia_19");
    const ft = filetree.get();
    return {
      ft,
    }
  },
  methods: {
    clicked: function() {
      store.browser.visible = false;
      console.log(store.browser)
    },
    browser_visible() {
      return store.browser.visible;
    }
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