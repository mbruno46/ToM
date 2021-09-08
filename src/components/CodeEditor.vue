<template>
  <div ref="editor" class="text-editor" contenteditable="true" 
    @input="handleInput"
    @keydown="handleKeyDown"
    >
    <div single-line class="line"><br></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import {TexEditor} from '@/hooks/texeditor'

var e = null;

export default {
  setup() {
    const editor = ref(null);
    onMounted(() => {
      e = TexEditor(editor.value);
    });
    return {
      editor
    }
  },
  methods: {
    focus: function() {
      this.$refs.editor.focus();
    },
    handleInput: function() {
      e.highlightCaretLine();
    },
    handleKeyDown: function(event) {
      let prevent = false;

      if (event.key == "Backspace") {
        prevent = e.preventBackspace();
      }

      if ((event.ctrlKey || event.metaKey)) {
        // prevent = true;
        // if (event.key=="x") {e.fillClipboard();}
        if (event.key == "/") {e.addrmComment();}
      }

      if (event.key == "Tab") {
        prevent = true;
        if (event.shiftKey) {
          e.removeTab();
        } else {
          e.insertTab();
        }
      }

      if (prevent) {
        event.preventDefault();
      }
    }
  }
}
</script>

<style scoped>

.text-editor {
  font-family: 'Source Code Pro', monospace;
  font-size: 1rem;
  outline: none;
  background-color: var(--bg1);
  color: var(--selected);
  text-align: left;
  white-space: nowrap;
  counter-reset: div;
}

.line {
  margin: 0 0 0 4.5rem;
  position: relative;
}

.text-editor > .line:before {
  background-color: var(--bg1);
  color: var(--selected);
  content: counter(div);
  counter-increment: div;
  position: absolute;
  left: -4.5rem;
	-moz-box-sizing:border-box;
	-webkit-box-sizing:border-box;
	box-sizing:border-box;
  width: 4rem;
  padding-right: 0.5rem;
  text-align: right;
}
</style>