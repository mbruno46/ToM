import {Highlighter} from '@/hooks/tex'
import {Cursor} from '@/hooks/cursor'

export function TexEditor(editor) {
  var h = Highlighter();
  var c = Cursor(editor);
  var lines = editor.children;
  var ntabs = 4;

  function insertTab() {
    let indices = c.getSelectedLines();
    var re = new RegExp(`^(\\s{0,${ntabs}})(.*)`,'g');
    c.save();
    // caret = selection length=0
    let caret = c.getCaret();
    if (caret != null) {
      let line = lines[caret[0]];
      let text = line.textContent;
      if (text.length == caret[1]) {
        line.innerHTML = h.run(text + " ".repeat(ntabs));
      } else {
        line.innerHTML = h.run(" ".repeat(ntabs) + text);
      }
      c.restore(ntabs, ntabs);
      return;
    }
    // selection
    let shift = [];
    for (var index=indices[0]; index<indices[1]+1; index++) {
      var text = lines[index].textContent;
      shift[index - indices[0]] = -text.length;
      let s = text.split(re);
      text = (s[1].length==ntabs ? s[1] : '') + s[2];
      lines[index].innerHTML = h.run(" ".repeat(ntabs) + text);
      shift[index - indices[0]] += ntabs;
      shift[index - indices[0]] += text.length;
    }
    c.restore(shift[0], shift[shift.length-1]);
  }

  function removeTab() {
    let indices = c.getSelectedLines();
    var re = new RegExp(`^(\\s{0,${ntabs}})(.*)`,'g');
    c.save();
    // selection
    let shift = [];
    for (var index=indices[0]; index<indices[1]+1; index++) {
      var text = lines[index].textContent;
      shift[index - indices[0]] = -text.length;
      let s = text.split(re);
      text = s[2];
      lines[index].innerHTML = h.run(text);      
      shift[index - indices[0]] += text.length;
    }
    c.restore(shift[0], shift[shift.length-1]);
  }

  function addrmComment() {
    let indices = c.getSelectedLines();
    var re = new RegExp(`^(\\s*)(%)?(.*)`,'g');
    c.save();
    let shift = [];
    for (var index=indices[0]; index<indices[1]+1; index++) {
      var text = lines[index].textContent;
      shift[index - indices[0]] = -text.length;
      let s = text.split(re);
      console.log(s);
      if (s[2]) {
        text = s[1] + s[3];
      } else {
        text = '%' + s[1] + s[3];
      }
      lines[index].innerHTML = h.run(text);
      shift[index - indices[0]] += text.length;
    }
    c.restore(shift[0], shift[shift.length-1]);
  }

  return {
    highlightCaretLine() {
      var target = c.getLine();
      c.save();
      target.innerHTML = h.run(target.textContent);
      c.restore();
    },
    insertTab,
    removeTab,
    addrmComment,
    preventBackspace() {
      if (lines.length==1) {
        if (lines[0].firstChild.nodeName == 'BR') {
          return true;
        }
      }
      return false;
    },
    clean(text = null) {
      while ((editor.lastChild) && (editor.children.length>1)) {
        editor.lastChild.remove();
      }
      if (text==null) {
        lines[0].innerHTML = "<br>"
      } else {
        lines[0].innerHTML = h.run(text);
      }
    },
    appendLine(text) {
      let newline = lines[0].cloneNode(false);
      if (text=="") {
        newline.innerHTML = "<br>";
      } else {
        newline.innerHTML = h.run(text);
      }
      editor.appendChild(newline);     
    },
    toString() {
      var text = ''
      lines.forEach(line => {
        text += `${line.textContent}\n`
      });
      return text;
    }
  }
}