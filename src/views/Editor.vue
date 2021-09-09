<template>
  <Toolbar>
    <app-button icon="fa-caret-right" title="Show browser" 
      :style="(browser_visible() ? 'display: none' : '')"
      class="caret"
      @click="clicked"/>
    <span :class="'label ' + (changed ? 'changed' : '')">{{filename}}</span>
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
import { ref, onMounted, watchEffect, computed } from 'vue';
import AppButton from '@/components/AppButton.vue';

export default {
  components: {
    Toolbar,
    CodeEditor,
    AppButton,
  },
  methods: {
    focus: function() {
      this.$refs.editor.focus();
    },
    clicked: function() {
      store.browser.visible = true;
    },
    browser_visible: function() {
      return store.browser.visible;
    }
  },
  setup() {
    const editor = ref(null);
    const filename = computed(()=>{return store.editor.name;})
    const changed = computed(()=>{return store.editor.changed;})

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
      changed,
      editor,
    }
  },
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

.caret {
  position: absolute;
  z-index: 1;
}

.changed::before {
  content: "* ";
}

.editor-container {
  width: 100%;
  height: calc(100% - var(--toolbar-height));
  overflow-x: scroll;
  overflow-y: scroll;
  background-color: var(--bg1);
}
</style>