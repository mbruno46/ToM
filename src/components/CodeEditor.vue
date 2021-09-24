<template>
  <div ref="editor" class="text-editor" contenteditable="true" spellcheck="false"
    @keydown="handleKeyDown"
    >
    <Line v-for="(val, index) in lines" :key="index" :text="val"/>
  </div>
  <div class="render">
    <Line v-for="(val, index) in lines" :key="index" :text="val" :highlight="true" />
  </div>
</template>

<script>
import Line from './Line.vue';
import { onMounted, ref } from 'vue';
import utils from '@/hooks/utils.js';
import store from '@/hooks/store'

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
    console.log('save ',s.anchorNode, s.anchorOffset, s.focusNode, s.focusOffset);
    anchor = getIndexPos(s.anchorNode, s.anchorOffset);
    focus = getIndexPos(s.focusNode, s.focusOffset);
    console.log('saving ', anchor, focus);
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

  return {
    anchor() {return anchor},
    focus() {return focus},
    save,
    set,
    shift(na, nf=null) {
      shifter(anchor, na);
      shifter(focus, (nf==null) ? na : nf);
    },
    restore() {
      s.setBaseAndExtent(editor.children[anchor.index].firstChild, anchor.pos, editor.children[focus.index].firstChild, focus.pos);        
    },
    oriented() {
      if (anchor.index==focus.index) {
        return [anchor.index, anchor.index, Math.min(anchor.pos, focus.pos), Math.max(anchor.pos, focus.pos)]
      } else if (anchor.index<focus.index) {
        return [anchor.index, focus.index, anchor.pos, focus.pos];
      } else if (anchor.index>focus.index) {
        return [focus.index, anchor.index, focus.pos, anchor.pos];
      }
    },
    isCollapsed() {
      return (anchor.index==focus.index) && (anchor.pos==focus.pos);
    },
    translate(na, nf=null) {
      anchor.pos += na;
      focus.pos += (nf==null) ? na : nf;
      if (anchor.pos<0) anchor.pos = 0;
      if (focus.pos<0) focus.pos = 0;
    }
  }
}


function History() {
  var stack = [];
  var at = -1;
  var NMAX = 50;
  var recording = false;
  var undo = {};
  var redo = {};

  return {
    reset() {
      stack = [];
      at = -1;
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
      console.log('undo ', at, stack)
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
    }
  }
}

var s = null;
var ntabs = 4;
var h = History();
var user_typing = {timer: null, time: 250};

export default {
  name: 'CodeEditor',
  components: {
    Line,
  },
  setup() {
    const editor = ref(null);
    const lines = ref(['']);

    onMounted(() => {
      s = Selection(editor.value, lines.value);

      var observer = new MutationObserver(()=>{s.restore();});
      observer.observe(editor.value, {
        subtree: true,
        childList: true,
        characterData: true,
      })
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
      h.addUndo(()=>{
        console.log('undo insert', s.anchor(), s.focus(), -text.length);
        deleteTextAtCaret(-text.length);});
    }

    function deleteTextAtCaret(dir) {
      h.addRedo(()=>{deleteTextAtCaret(dir);})

      s.shift(0, (s.isCollapsed()) ? dir : 0);
      let o = s.oriented();
      console.log('oriented ',o)
      let t0 = lines.value[o[0]].substring(0,o[2]);
      let t1 = lines.value[o[1]].substring(o[3]);
      var oldt = '';
      if (o[0]==o[1]) oldt = lines.value[o[0]].substring(o[2],o[3]);
      else {
        oldt = lines.value[o[0]].substring(o[2]);
        for (var i=o[0]+1;i<o[1];i++) oldt += '\n' + lines.value[i];
        oldt += '\n' + lines.value[o[1]].substring(0,o[3]);
      }
      lines.value.splice(o[0], o[1]+1-o[0], t0+t1);

      s.set({index: o[0], pos: o[2]});
      h.addUndo(()=>{
        console.log('undo delete ', s.anchor(), s.focus());
        insertTextAtCaret(oldt);});
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
    }

    return {
      editor,
      lines,
      insertTextAtCaret,
      deleteTextAtCaret,
      getTabbing,
      tab,
      comment,
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
      s.save();

      console.log(event.key, event.key.length)
      if ((event.ctrlKey || event.metaKey)) {
        if (event.key == "z") {
          if (event.shiftKey) h.redo();
          else h.undo();
        } else {
          h.startRecord();
          if (event.key == "/") this.comment();
          h.closeRecord();
        }
      } else {
        store.editor.changed = true;

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
            this.deleteTextAtCaret(0);
            this.insertTextAtCaret("\n" + " ".repeat(this.getTabbing()));
          } else if (event.key == "Tab") {
            if (event.shiftKey) this.tab(-1);
            else this.tab(+1);
          } else if (event.key == "Backspace") {
            this.deleteTextAtCaret(-1);
          } else if (event.key == "Delete") {
            this.deleteTextAtCaret(+1);
          }

          h.closeRecord();
        }
      }      

      if (prevent) {
        event.preventDefault();
      }
    },
    refreshEditor(text) {
      this.focus();
      h.reset();
      h.startRecord();
      this.insertTextAtCaret(text);
      h.closeRecord();
    },
    getText() {
      var text = ''
      this.lines.forEach(l => {
        text += `${l}\n`
      });
      return text;
    }
  }
}
</script>


<style scoped>
.render {
  font-family: 'Source Code Pro', monospace;
  font-size: 1rem;
  outline: none;
  color: var(--selected);
  text-align: left;
  white-space: nowrap;
  counter-reset: div;
  position: absolute;
  pointer-events: none;
  z-index: 2;
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
  font-size: 1rem;
  outline: none;
  text-align: left;
  white-space: nowrap;
  /* margin-left: 4.5rem; */
  caret-color: var(--selected);
  position: absolute;
  z-index: 1;
}

</style>