<template>
  <div class="main-panel">
    <div class="browser-container">
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

export default {
  name: 'App',
  components: {
    Editor,
    Footer,
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
  background-color: var(--bg0);
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
}

.main-panel {
  width: 100%;
  display: flex;
  flex-flow: row;
}

.editor-container {
  background-color: var(--bg1);
  width: 50%;
  height: 100%;
  min-height: 800px;
  overflow-x: scroll;
  overflow-y: scroll;
}

.viewer-container {
  width: 50%;
  height: 100%;
  min-height: 800px;
  overflow-x: scroll;
  overflow-y: scroll;  
}

</style>
