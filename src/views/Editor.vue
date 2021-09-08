<template>
  <Toolbar>
    <span class="label">{{filename}}</span>
  </Toolbar>
  <div class="editor-container">
    <code-editor ref="editor"/>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar.vue';
import CodeEditor from '@/components/CodeEditor.vue';
import store from '@/hooks/store.js';
import utils from '@/hooks/utils.js';
import { ref, onMounted, watchEffect } from 'vue';

export default {
  components: {
    Toolbar,
    CodeEditor,
  },
  methods: {
    focus: function() {
      this.$refs.editor.focus();
    }
  },
  setup() {
    const editor = ref(null);
    const filename = store.editor.name;
    
    onMounted(() => {
      watchEffect(() => {
        if (store.editor.read) {
          editor.value.refreshEditor(
            utils.loadTexFile(store.editor.path)
          )
        }
      });
    });

    return {
      filename,
      editor,
    }
  }
}
</script>

<style scoped>
.label {
  font-family: 'Source Code Pro', monospace;
  font-size: 1rem;
  margin-top: calc((var(--toolbar-height) - 1rem) / 2);
  margin-bottom: calc((var(--toolbar-height) - 1rem) / 2);
  display: inline-block;
  width: 100%;
  text-align: center;
}

.editor-container {
  width: 100%;
  height: calc(100% - var(--toolbar-height));
  overflow-x: scroll;
  overflow-y: scroll;
  background-color: var(--bg1);
}
</style>