<template>
  <div>
    <div ref="editor" class="text-editor" :class="fontsize"
      contenteditable="true" spellcheck="false"
      @keydown="handleKeyDown"
      >
      <editor-line v-for="(val) in lines" :key="val" :text="val"/>
    </div>
    <div class="render" :class="fontsize">
      <editor-line v-for="(val) in lines" :key="val" :text="val" :highlight="true" />
    </div>
    <auto-complete ref="ac" @autocomplete-choice="autoComplete"/>
  </div>
</template>

<script>
import EditorLine from './EditorLine.vue';
import { onMounted, ref, watch } from 'vue';
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
    console.log(r0, r0.getClientRects()[0]);
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
      var p = editor.parentElement;
      function scroll(ref, sc, max) {
        if (ref>sc + max) sc = ref-max;
        else {
          if (ref<sc) sc = ref;
        }
        return (sc<0) ? 0 : sc;
      }
      p.scrollTo(scroll(c.x+24, p.scrollLeft, p.offsetWidth), scroll(c.y+24, p.scrollTop, p.offsetHeight));
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
      if (!recording) {return;}
      redo.events.push(event);
    },
    addUndo(event) {
      if (!recording) {return;}
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
  setup() {
    const editor = ref(null);
    const lines = ref(['']);
    const ac = ref(null);
    const fontsize = ref('font12');

    onMounted(() => {
      watch(()=>{
        s = Selection(editor.value, lines.value);
      });

      var observer = new MutationObserver(()=>{
        s.restore();
        s.scrollToSelection();

        let c = s.caret();
        ac.value.launch(lines.value[c.index].substring(0,c.pos), c.x, c.y);
        meta.parseTeXLine(store.editor.name, c.index, lines.value[c.index]);
      });
      observer.observe(editor.value, {
        subtree: true,
        childList: true,
        characterData: true,
      });
    });

    function insertTextAtCaret(text) {
      h.addRedo(()=>{insertTextAtCaret(text);})

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
      h.addUndo(()=>{deleteTextAtCaret(-text.length);});
      store.editor.changed = true;
    }

    function preventBackspace() {
      if (s.isCollapsed()) {
        let a = s.anchor();
        if ((a.index==0)&&(a.pos==0)) {return true;}
      }
      return false;
    }

    function deleteTextAtCaret(dir) {
      h.addRedo(()=>{deleteTextAtCaret(dir);})

      s.shift(0, (s.isCollapsed()) ? dir : 0);
      let o = s.oriented();
      let t0 = lines.value[o[0]].substring(0,o[2]);
      let t1 = lines.value[o[1]].substring(o[3]);
      var oldt = s.text();
      lines.value.splice(o[0], o[1]+1-o[0], t0+t1);

      s.set({index: o[0], pos: o[2]});
      h.addUndo(()=>{insertTextAtCaret(oldt);});
      store.editor.changed = true;
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

    function tab(m) {
      h.addRedo(()=>{tab(m);})

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
      h.addUndo(()=>{tab(-m);})
      store.editor.changed = true;
    }

    function comment() {
      h.addRedo(()=>{comment();})

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
      h.addUndo(()=>{comment();})
      store.editor.changed = true;
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
      lines,
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
      let prevent = !["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.key);
      if (this.$refs.ac.isActive()) {
        if (["ArrowDown","ArrowUp"].includes(event.key)) {
          prevent = true;
          this.$refs.ac.handleKeyDown(event);
        }
      }      
      s.save();

      console.log(event.key, event.key.length)
      if ((event.ctrlKey || event.metaKey)) {
        if (event.key == "z") {
          if (event.shiftKey) h.redo();
          else h.undo();
        } else {
          h.startRecord();

          if (event.key == "/") this.comment();
          else if (event.key == "x") {
            clipboard.writeText(s.text());
            this.deleteTextAtCaret(0);
          } else if (event.key == "c") {
            clipboard.writeText(s.text());
          } else if (event.key == "v") {
            this.deleteTextAtCaret(0);
            this.insertTextAtCaret(clipboard.readText());
          }

          h.closeRecord();
        }
      } else {
        if (event.key.length == 1) {
          if (!h.isRecording()) h.startRecord();
          this.deleteTextAtCaret(0);
          this.insertTextAtCaret(event.key);
          clearTimeout(user_typing.timer);
          user_typing.timer = setTimeout(()=>{h.closeRecord()}, user_typing.time);
        } else {
          clearTimeout(user_typing.timer);
          if (h.isRecording()) h.closeRecord();
          h.startRecord();

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

          h.closeRecord();
        }
      }

      if (event.key == "Escape") {
        if (this.$refs.ac.isActive()) {
          prevent = true;
          this.$refs.ac.handleKeyDown(event);
        }
      }

      console.log(event);
      if (prevent) {
        event.preventDefault();
      }
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
    setFontSize(size) {
      this.fontsize = `font${size}`
    }
  }
}
</script>


<style scoped>
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

.font10 {
  font-size: 10pt;
}
.font12 {
  font-size: 12pt;
}
.font14 {
  font-size: 14pt;
}
.font18 {
  font-size: 18pt;
}
</style>