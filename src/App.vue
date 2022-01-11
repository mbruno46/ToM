<template>
  <div class="main-panel">
    <div :class="'container transition ' + (browser_visible ? 'width-25' : 'width-0')">
      <file-browser ref="file_browser"/>
    </div>
    <div ref="panel"
      :class="'transition ' + (browser_visible ? 'width-75' : 'width-100')"
      style="height: 100; display:flex; flex-flow:row;"
      @mousemove="resize"
      @mouseup="stopResizing"
    >
      <div class="container" 
        :style="`width: calc(${width.editor}*(100% - 4px))`"
        @click="this.$refs.editor.focus()">
        <app-editor ref="editor"/>
      </div>
      <div class="container resizer"
        @mousedown="startResizing"
      />
      <div class="container"
        :style="`width: calc(${width.viewer}*(100% - 4px))`">
        <app-viewer ref="viewer" @sync="sync" @focus-line="focusLine($event)"/>
      </div>
    </div>
  </div>
  <footer-bar @find="find($event)"/>
</template>

<script>
import AppEditor from '@/views/AppEditor.vue';
import AppViewer from '@/views/AppViewer.vue';
import FooterBar from '@/views/FooterBar.vue';
import FileBrowser from '@/views/FileBrowser.vue';
import store from '@/hooks/store'
import { computed, ref } from '@vue/reactivity';

var offsetX = 0;
var resizing = false;
var width = 0;

export default {
  name: 'App',
  components: {
    AppEditor,
    FooterBar,
    FileBrowser,
    AppViewer,
  },
  setup() {
    const browser_visible = computed(()=>{return store.browser.visible;});
    const width = ref({editor: 0.5, viewer: 0.5});

    return {
      browser_visible,
      width,
    }
  },
  methods: {
    startResizing(event) {
      offsetX = event.pageX;
      resizing = true;
      width = this.width.editor;
    },
    resize(event) {
      let w = this.$refs.panel.offsetWidth - 4;
      let s = (event.pageX - offsetX)/w;
      if (resizing) {
        this.width.editor = width + s;
        this.width.viewer = 1 - this.width.editor;
      }
    },
    stopResizing() {
      resizing = false;
      width = 0;
    },
    sync() {
      store.loader.value = true;
      this.$refs.editor.save();
      this.$refs.viewer.compile(this.$refs.file_browser.reload);
    },
    find(word) {
      this.$refs.editor.find(word);
    },
    focusLine(idx) {
      this.$refs.editor.focusLine(idx);
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

.transition {
  transition: width 0.5s;
}

.width-0 {
  width: 0px;
}

.width-25 {
  width: 25%;
}

.width-75 {
  width: 75%;
}

.width-100 {
  width: 100%;
}

.resizer {
  height: 100%;
  cursor: col-resize;
  user-select: none;
  width: 4px;
}

.resizer:hover {
  border: 2px solid var(--fg);
}

*::selection {
  color: var(--selected);
  background: var(--dark-blue);
}
</style>
