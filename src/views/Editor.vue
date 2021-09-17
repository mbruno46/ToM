<template>
  <Toolbar>
    <app-button icon="fa-caret-right" title="Show browser" 
      :style="(browser_visible() ? 'display: none' : '')"
      class="caret"
      @click="clicked"/>
    <app-button icon="fa-save" title="Save"
      class="save"
      :style="(changed ? '' : 'display: none')"
      @click="save"/>
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

import {MetaData} from '@/hooks/metadata.js';
var meta = MetaData();

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
    },
  },
  setup() {
    const editor = ref(null);
    const filename = computed(()=>{return store.editor.name;})
    const changed = computed(()=>{return store.editor.changed;})

    var autosave_timer = null;
    
    function save() {
      if ((store.editor.path != '') && (store.editor.changed)) {
        utils.saveTextFile(store.editor.path, editor.value.getText());
        store.editor.changed = false;
        meta.parseFile(store.editor.name);
      }
    }

    onMounted(() => {
      watchEffect(() => {
        if (store.editor.read) {
          editor.value.refreshEditor(
            utils.loadTextFile(store.editor.path)
          );
          store.editor.read = false;
        }
      });
      watchEffect(() => {
        if (store.editor.clean) {
          editor.value.clean();
          store.editor.clean = false;
        }
      });
      watchEffect(() => {
        if (store.editor.changed) {
          if (store.preferences.autosave == 0) {
            clearInterval(autosave_timer);
          } else {
            autosave_timer = window.setInterval(save, store.preferences.autosave);
          }
        } else {
          clearInterval(autosave_timer);
        }
      })
    });

    return {
      filename,
      changed,
      editor,
      save,
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
  position: absolute;
  z-index: 0;
}

.caret {
  position: absolute;
  z-index: 1;
}

.save {
  position: absolute;
  z-index: 2;
  right: 0;
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

span {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>