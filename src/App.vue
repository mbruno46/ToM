<template>
  <div class="main-panel">
    <div class="browser-container">
      <FileTree />
    </div>
    <div class="editor-container" @click="clicked">
      <Editor ref="editor"/>
    </div>
    <div class="viewer-container">
    </div>
  </div>
  <Footer/>
</template>

<script>
import Editor from './components/Editor.vue';
import Footer from '@/components/Footer.vue';
import FileTree from '@/components/FileTree.vue';

export default {
  name: 'App',
  components: {
    Editor,
    Footer,
    FileTree,
  },
  mounted() {
    this.$refs.editor.focus();
  },
  methods: {
    clicked() {
      this.$refs.editor.focus();
    }
  }
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

.browser-container {
  width: 20%;
}

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
