<template>
  <div class="editor-container" @click="clicked">
    <Editor ref="editor"/>
  </div>
</template>

<script>
import Editor from './components/Editor.vue';

export default {
  name: 'App',
  components: {
    Editor
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
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.editor-container {
  background-color: var(--bg1);
  width: 400px;
  height: 800px;
}

</style>
