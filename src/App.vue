<template>
  <div class="main-panel">
    <div :class="'container ' + (browser_visible ? 'width-20' : 'width-0')">
      <file-browser />
    </div>
    <div class="container" style="width:40%"  @click="this.$refs.editor.focus()">
      <editor ref="editor"/>
    </div>
    <div class="container">
    </div>
  </div>
  <Footer/>
</template>

<script>
import Editor from '@/views/Editor.vue';
import Footer from '@/components/Footer.vue';
import FileBrowser from '@/views/FileBrowser.vue';
import store from '@/hooks/store'
import { computed } from '@vue/reactivity';

export default {
  name: 'App',
  components: {
    Editor,
    Footer,
    FileBrowser,
  },
  setup() {
    const browser_visible = computed(()=>{return store.browser.visible;})
    return {
      browser_visible,
    }
  }
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg);
  color: var(--fg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.main-panel {
  width: 100%;
  height: calc(100vh - 3rem);
  display: flex;
  flex-flow: row;
}

.container {
  height: 100%;
  display: flex;
  flex-flow: column; 
}

.width-0 {
  width: 0px;
}

.width-20 {
  width: 20%;
}

/* .browser-container {
  width: 20%;
  height: 100%;
  min-height: 800px;
  display: flex;
  flex-flow: column;
} */

/* .editor-container {
  background-color: var(--bg1);
  width: 40%;
  height: 100%;
  min-height: 800px;
  overflow-x: scroll;
  overflow-y: scroll;
} */

/* .viewer-container {
  width: 40%;
  height: 100%;
  min-height: 800px;
  overflow-x: scroll;
  overflow-y: scroll;  
} */

</style>
