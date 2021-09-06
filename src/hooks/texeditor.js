import {Highlighter} from '@/hooks/tex'
import {Cursor} from '@/hooks/cursor'

export function TexEditor(editor) {
  var h = Highlighter();
  var c = Cursor(editor);
  var lines = editor.children;

  function addrmTab(ntabs, add=true) {
    let indices = c.getSelectedLines();
    var re = new RegExp(`^(\\s{0,${ntabs}})(.*)`,'g');
    c.save();
    let shift = [];
    for (var index=indices[0]; index<indices[1]+1; index++) {
      var text = lines[index].textContent;
      shift[index - indices[0]] = -text.length;
      let s = text.split(re);
      if (add) {
        text = (s[1].length==ntabs ? s[1] : '') + s[2];
        lines[index].innerHTML = h.run("&nbsp;".repeat(ntabs) + text);
        shift[index - indices[0]] += ntabs;
      } else {
        text = s[2];
        lines[index].innerHTML = h.run(text);
      }
      console.log(add, text);
      shift[index - indices[0]] += text.length;
    }
    c.restore(shift[0], shift[shift.length-1]);
  }

  function addrmComment() {
    let indices = c.getSelectedLines();
    var re = new RegExp(`^(\\s*%)?(.*)`,'g');
    c.save();
    let shift = [];
    for (var index=indices[0]; index<indices[1]+1; index++) {
      var text = lines[index].textContent;
      shift[index - indices[0]] = -text.length;
      let s = text.split(re);
      console.log(s);
      if (s[1]) {
        text = s[2];
      } else {
        text = '%' + s[2];
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
    insertTab() {
      addrmTab(4, true);
    },
    removeTab() {
      addrmTab(4, false);
    },
    addrmComment,
    preventBackspace() {
      if (lines.length==1) {
        if (lines[0].firstChild.nodeName == 'BR') {
          return true;
        }
      }
      return false;
    },
  }
}