<template>
  <div :style="style">
    <div ref="editor" class="text-editor"
      contenteditable="true" spellcheck="false"
      @keydown="handleKeyDown"
      @focus="setFocusLine"
      @click="setFocusLine"
      >
      <editor-line v-for="(val) in lines" :key="val" :text="val"/>
    </div>
    <div ref="render" class="render">
      <editor-line v-for="(val, idx) in lines" 
        :key="val" 
        :text="val" 
        :highlight="true" 
        :focus="idx == focus_line"
      />
    </div>
    <auto-complete ref="ac" @autocomplete-choice="autoComplete" :fontsize="fontsize"/>
    <div ref="filler" class="filler" />
  </div>
</template>

<script>
import EditorLine from './EditorLine.vue';
import { onMounted, ref, watchEffect } from 'vue';
import AutoComplete from './AutoComplete.vue'

import utils from '@/hooks/utils.js';
import store from '@/hooks/store'
import {MetaData} from '@/hooks/metadata.js';
var meta = MetaData();

const { clipboard } = window.require('electron');

function Selection(editor, lines) {
  var anchor = {index: 0, pos:0}
  var focus = {index: 0, pos: 0};
  var s = document.getSelection();

  function getIndexPos(node, ofs) {
    var line = (node.nodeName=="DIV") ? node : node.parentElement;
    let idx = utils.getIndexOf(editor.children, line);
    let r = new Range();
    r.selectNodeContents(line);
    r.setEnd(node, ofs);
    return {index: idx, pos: r.toString().length};
  }

  function save() {
    anchor = getIndexPos(s.anchorNode, s.anchorOffset);
    focus = getIndexPos(s.focusNode, s.focusOffset);
  }

  function set(a, f=null) {
    anchor = utils.copyObject(a);
    focus = utils.copyObject((f==null) ? a : f);
  }

  function shifter(ref, length) {
    while (length>0) {
      let n = lines[ref.index].length - ref.pos;
      if (length>n) {
        ref.index++;
        length--;
        ref.pos = 0;
        length -= n;
      } else {
        ref.pos += length;
        length = 0;
      }
    }
    while (length<0) {
      if (ref.pos + length<0) {
        ref.index--;
        length++;
        ref.pos = lines[ref.index].length;
        length += ref.pos;
      } else {
        ref.pos += length;
        length = 0;
      }        
    }
  }

  function oriented() {
    if (anchor.index==focus.index) {
      return [anchor.index, anchor.index, Math.min(anchor.pos, focus.pos), Math.max(anchor.pos, focus.pos)]
    } else if (anchor.index<focus.index) {
      return [anchor.index, focus.index, anchor.pos, focus.pos];
    } else if (anchor.index>focus.index) {
      return [focus.index, anchor.index, focus.pos, anchor.pos];
    }
  }

  function caret() {
    let r0 = s.getRangeAt(0);
    var rect = {left: 0, top: s.baseNode.parentNode.getBoundingClientRect().top};
    var ofs = editor.getBoundingClientRect();
    if (r0.getClientRects().length>0) rect = r0.getClientRects()[0];
    return {index: anchor.index, pos: anchor.pos, x: rect.left - ofs.x, y: rect.top - ofs.y};
  }

  return {
    reset() {
      anchor = {index: 0, pos:0}
      focus = {index: 0, pos: 0}
    },
    anchor() {return anchor},
    focus() {return focus},
    save,
    set,
    oriented,
    shift(na, nf=null) {
      shifter(anchor, na);
      shifter(focus, (nf==null) ? na : nf);
    },
    restore() {
      s.removeAllRanges();
      s.setBaseAndExtent(editor.children[anchor.index].firstChild, anchor.pos, editor.children[focus.index].firstChild, focus.pos);
    },
    caret,
    scrollToSelection() {
      let c = caret();
      var p = editor.parentElement.parentElement;
      function scroll(ref, sc, max, pad) {
        let lim_sup = max - pad;
        let lim_inf = pad;
        if (ref>sc + lim_sup) sc = ref-lim_sup;
        else {
          if (ref<sc+lim_inf) sc = Math.max(0, ref-lim_inf);
        }
        return (sc<0) ? 0 : sc;
      }
      p.scrollTo(scroll(c.x, p.scrollLeft, p.offsetWidth, 64), scroll(c.y+24, p.scrollTop, p.offsetHeight, 48));
    },
    isCollapsed() {
      return (anchor.index==focus.index) && (anchor.pos==focus.pos);
    },
    translate(na, nf=null) {
      anchor.pos += na;
      focus.pos += (nf==null) ? na : nf;
      if (anchor.pos<0) anchor.pos = 0;
      if (focus.pos<0) focus.pos = 0;
    },
    text() {
      let o = oriented();
      if (o[0]==o[1]) return lines[o[0]].substring(o[2],o[3]);
      else {
        let t = lines[o[0]].substring(o[2]);
        for (var i=o[0]+1;i<o[1];i++) t += '\n' + lines[i];
        t += '\n' + lines[o[1]].substring(0,o[3]);
        return t;
      }
    },
  }
}


function History() {
  var stack = [];
  var at = 0;
  var NMAX = 50;
  var recording = false;
  var undo = {};
  var redo = {};

  return {
    reset() {
      stack = [];
      at = 0;
    },
    isRecording() {
      return recording;
    },
    startRecord() {
      redo = {
        anchor: utils.copyObject(s.anchor()), 
        focus: utils.copyObject(s.focus()), 
        events: [],
      }
      undo = {events: []};
      recording = true;
    },
    addRedo(event) {
      if (!recording) {this.startRecord();}
      redo.events.push(event);
    },
    addUndo(event) {
      if (!recording) {console.error('history addundo');}
      undo.events.push(event);
    },
    closeRecord() {
      if (undo.events.length==0) {return;}
      undo.anchor = utils.copyObject(s.anchor())
      undo.focus = utils.copyObject(s.focus())
      stack.splice(at, stack.length - at, {undo: undo, redo: redo});
      at++;
      undo = {};
      redo = {};
      recording = false;
      if (at==NMAX) {
        stack.splice(0,1);
        at--;
      }
    },
    undo() {
      if (at==0) {return;}
      at--;
      let _s = stack[at].undo;
      s.set(_s.anchor, _s.focus);
      _s.events.slice().reverse().forEach(e => {e();});
    },
    redo() {
      if (at==stack.length) {return;}
      let _s = stack[at].redo;
      s.set(_s.anchor, _s.focus);
      _s.events.forEach(e => {e();});
      at++;
    },
    inspect() {
      console.log('history ', at);
      console.log(stack);
    }
  }
}


var s = null;
var ntabs = 4;
var h = History();
var user_typing = {timer: null, time: 250};
var finder = {word: '', index: 0, pos: 0};

export default {
  name: 'CodeEditor',
  components: {
    EditorLine,
    AutoComplete,
  },
  props: {
    style: String,
  },
  setup() {
    const editor = ref(null);
    const lines = ref(['']);
    const ac = ref(null);
    const fontsize = ref('font12');
    const filler = ref(null);
    const focus_line = ref(0);

    onMounted(() => {
      watchEffect(()=>{
        s = Selection(editor.value, lines.value);
      });

      var observer = new MutationObserver(()=>{
        s.restore();
        s.scrollToSelection();
        
        let c = s.caret();
        ac.value.launch(lines.value[c.index].substring(0,c.pos), c.x, c.y);
        if (store.editor.name != '') {
          meta.parseTeXLine(store.editor.name, c.index, lines.value[c.index]);
        }

        filler.value.style.top = editor.value.offsetHeight + 'px';
      });
      observer.observe(editor.value, {
        subtree: true,
        childList: true,
        characterData: true,
      });
    });

    function _insertTextAtCaret(text) {
      let c = s.anchor();
      let ll = text.split(/\r?\n/);
      let t = lines.value[c.index].substring(c.pos);
      lines.value[c.index] = lines.value[c.index].substring(0,c.pos) + ll[0];
      c.pos += ll[0].length;
      for (var i=1;i<ll.length;i++) {
        c.index++;
        c.pos = ll[i].length;
        lines.value.splice(c.index, 0, ll[i]);
      } 
      if (t.length>0) lines.value[c.index] += t;

      s.set(c);
      return -text.length;
    }

    function preventBackspace() {
      if (s.isCollapsed()) {
        let a = s.anchor();
        if ((a.index==0)&&(a.pos==0)) {return true;}
      }
      return false;
    }

    function _deleteTextAtCaret(dir) {
      s.shift(0, (s.isCollapsed()) ? dir : 0);
      let o = s.oriented();
      let t0 = lines.value[o[0]].substring(0,o[2]);
      let t1 = lines.value[o[1]].substring(o[3]);
      var oldt = s.text();
      lines.value.splice(o[0], o[1]+1-o[0], t0+t1);

      s.set({index: o[0], pos: o[2]});
      return oldt;
    }

    function whiteSpaces(idx) {
      let n = 0;
      let t = lines.value[idx];
      for (var i=0;i<t.length;i++) {
        if (t[i]==" ") n++;
        else break;
      }
      return n;
    }

    function getTabbing() {
      let c = s.anchor();
      return Math.floor(whiteSpaces(c.index) / ntabs) * ntabs;
    }

    function _tab(m) {
      let o = s.oriented();
      let shift = [];
      for (var i=o[0];i<o[1]+1;i++) {
        let n = whiteSpaces(i);
        let nn = (Math.floor(n/ntabs) + m);
        let nt = ntabs*( (nn<0) ? 0 : nn );
        lines.value[i] = " ".repeat(nt) + lines.value[i].substring(n);
        shift.push(nt - n);
      }

      s.translate(shift[0], shift[shift.length-1]);
      return -m;
    }

    function _comment() {
      let o = s.oriented();
      // dry run
      let count = 0;
      for (var i=o[0];i<o[1]+1;i++) {
        count++;
        if (lines.value[i].match(/^\s*%.*$/g)) count--;
      }
      var re = new RegExp(`^(\\s*)(%\\s?)?(.*)`,'g');
      let shift = [];
      for (i=o[0];i<o[1]+1;i++) {
        let text = lines.value[i];
        if (count==0) {
          let s = text.split(re);
          lines.value[i] = s[1] + s[3];
        } else lines.value[i] = '% ' + text;
        shift.push(lines.value[i].length - text.length);
      }

      s.translate(shift[0], shift[shift.length-1]);
      return null;
    }

    function execute_command(f, farg, r) {
      h.addRedo(()=>{f(farg);})
      let rarg = f(farg);
      h.addUndo(()=>{r(rarg);})
      store.editor.changed = true;
    }

    function insertTextAtCaret(text) {
      execute_command(_insertTextAtCaret, text, _deleteTextAtCaret)
    }

    function deleteTextAtCaret(dir) {
      execute_command(_deleteTextAtCaret, dir, _insertTextAtCaret);
    }

    function tab(m) {
      execute_command(_tab, m, _tab);
    }

    function comment() {
      execute_command(_comment, null, _comment);
    }

    function autoComplete(word) {
      let c = s.anchor();
      var text = lines.value[c.index].substring(0,c.pos);
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
      filler,
      lines,
      focus_line,
      ac,
      insertTextAtCaret,
      deleteTextAtCaret,
      preventBackspace,
      getTabbing,
      tab,
      comment,
      autoComplete,
      fontsize,
    }
  },
  methods: {
    clean() {
      this.lines = [""];
    },
    focus: function() {
      this.$refs.editor.focus();
    },
    handleKeyDown: function(event) {
      // h.inspect();

      let prevent = !["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.key);
      if (this.$refs.ac.isActive()) {
        if (["ArrowDown","ArrowUp"].includes(event.key)) {
          prevent = true;
          this.$refs.ac.handleKeyDown(event);
        }
      }      
      s.save();

      clearTimeout(user_typing.timer);
      if ((event.ctrlKey || event.metaKey)) {
        if (h.isRecording()) h.closeRecord();
        
        if (event.key == "z") {
          if (event.shiftKey) h.redo();
          else h.undo();
        } else if (event.key == "/") {
          this.comment();
        } else if (event.key == "x") {
          clipboard.writeText(s.text());
          this.deleteTextAtCaret(0);
        } else if (event.key == "c") {
          clipboard.writeText(s.text());
        } else if (event.key == "v") {
          this.deleteTextAtCaret(0);
          this.insertTextAtCaret(clipboard.readText());
        }

        if (h.isRecording()) h.closeRecord();
      } else {
        if (event.key.length == 1) {
          this.deleteTextAtCaret(0);
          this.insertTextAtCaret(event.key);
          user_typing.timer = setTimeout(()=>{h.closeRecord()}, user_typing.time);
        } else {
          if (h.isRecording()) h.closeRecord();
  
          if (event.key == "Enter") {
            if (this.$refs.ac.isActive()) {
              this.$refs.ac.handleKeyDown(event);
            } else {
              this.deleteTextAtCaret(0);
              this.insertTextAtCaret("\n" + " ".repeat(this.getTabbing()));
            }
          } else if (event.key == "Tab") {
            if (event.shiftKey) this.tab(-1);
            else this.tab(+1);
          } else if (event.key == "Backspace") {
            if (!this.preventBackspace()) this.deleteTextAtCaret(-1);
          } else if (event.key == "Delete") {
            this.deleteTextAtCaret(+1);
          }

          if (h.isRecording()) h.closeRecord();
        }
      }

      if (event.key == "Escape") {
        if (this.$refs.ac.isActive()) {
          prevent = true;
          this.$refs.ac.handleKeyDown(event);
        }
      }

      if (prevent) {
        event.preventDefault();
      }
      
      this.setFocusLine();
    },
    setFocusLine() {
      let focus_db = utils.debouncer(() => {
        s.save();
        this.focus_line = s.focus().index;
      }, 50);
      focus_db();
    },
    refreshEditor(text_lines) {
      this.focus();
      s.reset();
      h.reset();
      this.clean();
      // debouncing leaves time to vue to empty the lines first and reload them
      // otherwise the :key="val" above creates conflicts 
      let db = utils.debouncer(()=>{
        this.lines = [];
        text_lines.forEach(line => {this.lines.push(line);})
      }, 100);
      db();
    },
    getText() {
      var text = this.lines[0];
      for (var i=1;i<this.lines.length;i++) text += `\n${this.lines[i]}`;
      return text;
    },
    findNext(word) {
      if (word != finder.word) {
        finder.index = 0;
        finder.pos = 0;
        finder.word = word;
      }
      for (var idx=finder.index;idx<this.lines.length;idx++) {
        let _pos = this.lines[idx].substring(finder.pos).indexOf(word);
        if (_pos<0) {
          finder.pos = 0;
        }
        else {
          finder.index = idx;
          finder.pos += _pos;
          s.set({index: finder.index, pos: finder.pos}, {
            index: finder.index, pos: finder.pos + word.length})
          s.restore();
          s.scrollToSelection();
          finder.pos += word.length;
          break;
        }
      }
      if (idx==this.lines.length) {
        finder.index=0;
        finder.pos=0;
      }
    },
    focusLine(idx) {
      s.set({index: idx-1, pos: 0});
      s.restore();
      s.scrollToSelection();
      this.focus_line = s.focus().index;
    },
    setFontSize(size) {
      this.$refs.editor.style.fontSize = `${size}pt`
      this.$refs.render.style.fontSize = `${size}pt`
      this.$refs.ac.setFontSize(size);
    },
  },
}
</script>


<style scoped>
.filler {
  position: relative;
  width:100%;
  height: calc(100vh - 2*var(--toolbar-height) - 2rem);
}

.render {
  font-family: 'Source Code Pro', monospace;
  /* font-size: 1rem; */
  outline: none;
  color: var(--selected);
  text-align: left;
  white-space: nowrap;
  counter-reset: div;
  position: absolute;
  pointer-events: none;
  z-index: 2;
  padding-right: 4rem;
}

.render > .line:before {
  background-color: var(--bg1);
  color: var(--fg);
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

.render > .focus:before {
  color: var(--selected);
}

.text-editor {
  font-family: 'Source Code Pro', monospace;
  /* font-size: 1rem; */
  outline: none;
  text-align: left;
  white-space: nowrap;
  /* margin-left: 4.5rem; */
  caret-color: var(--selected);
  position: absolute;
  z-index: 1;
  padding-right: 4rem;
}
</style>