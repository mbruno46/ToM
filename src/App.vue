<template>
  <div class="main-panel">
    <div class="container" style="width:20%">
      <file-browser />
    </div>
    <!-- <div class="browser-container">
      <Toolbar>
        <AppButton icon="fa-folder-open" title="Open notebook"/>
      </Toolbar>
      <FileBrowser />
    </div> -->
    <!-- <div class="editor-container" @click="clicked">
      <Editor ref="editor"/>
    </div> -->
    <div class="container" style="width:40%"  @click="this.$refs.editor.focus()">
      <editor ref="editor"/>
    </div>
    <div class="viewer-container">
    </div>
  </div>
  <Footer/>
</template>

<script>
import Editor from '@/views/Editor.vue';
import Footer from '@/components/Footer.vue';
import FileBrowser from '@/views/FileBrowser.vue';

export default {
  name: 'App',
  components: {
    Editor,
    Footer,
    FileBrowser,
  },
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 100vw;
  background-color: var(--bg);
  color: var(--fg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.main-panel {
  width: 100%;
  display: flex;
  flex-flow: row;
}

.container {
  height: 100%;
  min-height: 800px;
  display: flex;
  flex-flow: column; 
}

/* .browser-container {
  width: 20%;
  height: 100%;
  min-height: 800px;
  display: flex;
  flex-flow: column;
} */

.editor-container {
  background-color: var(--bg1);
  width: 40%;
  height: 100%;
  min-height: 800px;
  overflow-x: scroll;
  overflow-y: scroll;
}

.viewer-container {
  width: 40%;
  height: 100%;
  min-height: 800px;
  overflow-x: scroll;
  overflow-y: scroll;  
}

</style>
