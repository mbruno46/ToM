<template>
  <div ref="editor" class="text-editor" contenteditable="true" @input="handleInput">
    <div single-line class="line"><br></div>
  </div>
</template>

<script>
import {Highlighter} from '@/hooks/tex'
import {Cursor} from '@/hooks/cursor'

var h = Highlighter();
var c = Cursor();

export default {
  methods: {
    focus: function() {
      this.$refs.editor.focus();
    },
    handleInput: function() {
      var target = c.getLine();
      c.save();
      target.innerHTML = h.run(target.textContent);
      c.restore();
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
  overflow-x: scroll;
  overflow-y: scroll;
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