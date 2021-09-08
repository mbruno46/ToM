<template>
  <Toolbar>
    <AppButton icon="fa-folder-open" title="Open notebook"/>
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

<script>
import Toolbar from '@/components/Toolbar.vue';
import AppButton from '@/components/AppButton.vue';
import TreeCell from '@/components/TreeCell.vue';
import {FileTree} from '@/hooks/filetree.js'

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
  height: calc(100% - var(--toolbar-height));
  background-color: var(--bg0);
  flex-grow: 1;
  overflow-y: scroll;
  overflow-x: scroll;
  font-size: 0.8rem;
}
</style>