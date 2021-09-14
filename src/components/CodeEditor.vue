<template>
  <div ref="editor" class="text-editor" contenteditable="true" 
    @input="handleInput"
    @keydown="handleKeyDown"
    >
    <div single-line class="line"><br></div>
  </div>
  <auto-complete ref="ac" @autocomplete-choice="autoComplete"/>
</template>

<script>
import { ref, onMounted } from 'vue'
import {Highlighter} from '@/hooks/highlight'
import {Cursor} from '@/hooks/cursor'
import store from '@/hooks/store'
import utils from '@/hooks/utils.js'
import AutoComplete from './AutoComplete.vue'

const { clipboard } = window.require('electron');

var h = Highlighter();
var c = null;
var e = null;
var lines = null;
var ntabs = 4;

export default {
  components: {
    AutoComplete,
  },
  setup() {
    const editor = ref(null);

    onMounted(() => {
      c = Cursor(editor.value);
      lines = editor.value.children;
      // e = TexEditor(editor.value);
      e = editor.value;
    });

    function clean(text = null) {
      while ((e.lastChild) && (lines.length>1)) {
        e.lastChild.remove();
      }
      if (text==null) {
        lines[0].innerHTML = "<br>"
      } else {
        lines[0].innerHTML = h(text);
      }
    }

    function preventBackspace() {
      if (lines.length==1) {
        if (lines[0].firstChild.nodeName == 'BR') {
          return true;
        }
      }
      return false;
    }

    function addrmComment() {
      let indices = c.getSelectedLines();
      var re = new RegExp(`^(\\s*)(%\\s?)?(.*)`,'g');
      c.save();
      var index;
      let count = indices[1]+1-indices[0];
      // dry run; check if all lines commented
      for (index=indices[0]; index<indices[1]+1; index++) {
        let text = lines[index].textContent;
        let s = text.split(re);
        if (s[2]) {
          count -= 1;
        }
      }
      // real run; uncomment only if all lines commented
      let shift = [];
      for (index=indices[0]; index<indices[1]+1; index++) {
        let text = lines[index].textContent;
        shift[index - indices[0]] = -text.length;
        if (count==0) {
          let s = text.split(re);
          text = s[1] + s[3];
        } else {
          text = '% ' + text;
        }
        lines[index].innerHTML = h(text);
        shift[index - indices[0]] += text.length;
      }
      c.restore(shift[0], shift[shift.length-1]);
    }

    function removeTab() {
      let indices = c.getSelectedLines();
      var re = new RegExp(`^(\\s{0,${ntabs}})(.*)`,'g');
      c.save();
      let shift = [];
      for (var index=indices[0]; index<indices[1]+1; index++) {
        var text = lines[index].textContent;
        shift[index - indices[0]] = -text.length;
        text = text.split(re)[2];
        lines[index].innerHTML = h(text);      
        shift[index - indices[0]] += text.length;
      }
      c.restore(shift[0], shift[shift.length-1]);
    }

    function insertTabLine(index, pos) {
      var re = new RegExp(`^(\\s{0,${ntabs}})(.*)`,'g');
      let line = lines[index];
      let text = line.textContent;
      let shift = -text.length;
      console.log(text, text.length, pos);
      // if caret at end of line then add at caret position
      // if caret inside line then add tab in front of line
      if (text.length == pos) {
        line.innerHTML = h(text + " ".repeat(ntabs));
      } else {
        let s = text.split(re);
        text = (s[1].length==ntabs ? s[1] : '') + s[2];
        line.innerHTML = h(" ".repeat(ntabs) + text);
      }
      shift += ntabs + text.length;
      return shift;
    }

    function insertTab() {
      let caret = c.getCaret();    
      c.save();
      let shift = [];
      if (caret != null) {
        shift[0] = insertTabLine(caret.index, caret.pos);
      } else {
        let indices = c.getSelectedLines();
        for (var index=indices[0]; index<indices[1]+1; index++) {
          shift[index - indices[0]] = insertTabLine(index, -1);
        }
      }
      c.restore(shift[0], shift[shift.length-1]);
    }

    function highlightLine(target) {
      c.save();
      target.innerHTML = h(target.textContent);
      c.restore();
    }

    function deleteSelectedText() {
      let r = c.getRange();
      r.deleteContents();
    }

    function insertTextAtCaret(text) {
      // insert text at caret position and moves caret to end of inserted text
      let r = c.getRange();
      r.insertNode(document.createTextNode(text));
      r.collapse(false);
      highlightLine(c.getLine());
    }
    
    function appendLine(text, idx = -1) {
      let newline = lines[0].cloneNode(false);
      if (text=="") {
        newline.innerHTML = "<br>";
      } else {
        newline.innerHTML = h(text);
      }
      utils.appendAtIndex(e, newline, idx);
    }

    function insertNewLine(tabbing = true) {
      let caret = c.getCaret();
      let idx = caret.index;
      let text = lines[idx].textContent;
      var n = 0;
      if (text != "") {
        lines[idx].innerHTML = h(text.substring(0,caret.pos));
        n = text.split(/^(\s*).*/g)[1].length;
        n = ntabs * Math.floor(n/ntabs);
      }
      appendLine(" ".repeat(tabbing ? n : 0) + text.substring(caret.pos), idx+1);
      c.setCaret(lines[idx + 1], tabbing ? n : 0);
    }

    function autoComplete(word) {
      c.restore();
      let caret = c.getCaret();
      var text = lines[caret.index].textContent.substring(0,caret.pos);
      for (var i=word.length;i>0;i--) {
        if (text.substring(text.length-i)==word.substring(0,i)) {
          insertTextAtCaret(word.substring(i));
          return;
        }
      }
      insertTextAtCaret(word);
    }

    return {
      editor,
      clean,
      highlightLine,
      preventBackspace,
      addrmComment,
      removeTab,
      insertTab,
      appendLine,
      deleteSelectedText,
      insertTextAtCaret,
      insertNewLine,
      autoComplete,
    }
  },
  methods: {
    focus: function() {
      this.$refs.editor.focus();
      c.restore();
    },
    launchAutoComplete() {
      let caret = c.getCaret();
      var text = lines[caret.index].textContent.substring(0,caret.pos);
      this.$refs.ac.launch(text, caret.x, caret.y);
    },
    handleInput: function() {
      this.launchAutoComplete();
      this.highlightLine(c.getLine());
      store.editor.changed = true;
    },
    handleKeyDown: function(event) {
      c.save();
      let prevent = false;

      if (event.key == "Backspace") {
        prevent = this.preventBackspace();
      }

      if ((event.ctrlKey || event.metaKey)) {
        if (event.key == "/") {this.addrmComment();}
        if (event.key == "x") {
          prevent = true;
          clipboard.writeText(c.getSelectedText());
          this.deleteSelectedText();
        } else if (event.key == "c") {
          prevent = true;
          clipboard.writeText(c.getSelectedText());
        } else if (event.key == "v") {
          prevent = true;
          let s = clipboard.readText().split(/\r?\n/);
          console.log(s);
          for (var i=0;i<s.length;i++) {
            if (i>0) this.insertNewLine(false);
            this.insertTextAtCaret(s[i]);
          }
        }
      }

      if (event.key == "Tab") {
        prevent = true;
        if (event.shiftKey) {
          this.removeTab();
        } else {
          this.insertTab();
        }
      }

      if (event.key == "Enter") {
        prevent = true;
        if (this.$refs.ac.isActive()) {
          this.$refs.ac.handleKeyDown(event);
        } else {
          this.deleteSelectedText();
          this.insertNewLine();
        }
      }

      if (this.$refs.ac.isActive()) {
        if (["ArrowDown","ArrowUp"].includes(event.key)) {
          prevent = true;
          this.$refs.ac.handleKeyDown(event);
        }
      }

      if (prevent) {
        event.preventDefault();
      }
    },
    refreshEditor(lines) {
      this.clean(lines[0]);
      for (var i=1; i<lines.length; i++) {
        this.appendLine(lines[i]);
      }
    },
    getText() {
      var text = ''
      lines.forEach(line => {
        text += `${line.textContent}\n`
      });
      return text;
    }
  }
}
</script>

<style scoped>

.text-editor {
  font-family: 'Source Code Pro', monospace;
  font-size: 1rem;
  outline: none;
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