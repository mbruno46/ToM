function Cursor(editor) {
  var anchor, focus;
  var line_pos = [];

  let s = document.getSelection();

  if (editor.textContent == "\n") {
    anchor = 0;
    focus = 0;
  }
  else {
    [anchor, focus] = findAnchorFocus(s, editor);
  }

  let min = (anchor <= focus) ? anchor : focus;
  let delta = Math.abs(anchor - focus);

  let idx = editor.textContent.substring(0,min).lastIndexOf('\n') + 1;
  line_pos.push(idx);
  for (var i=0;i<editor.textContent.substring(idx,idx+delta).split('\n').length-1;i++) {
    idx += editor.textContent.substring(idx).indexOf('\n')+1;
    line_pos.push(idx);
  }

  return {
    getSelection() {
      return [anchor, focus];
    },
    setSelection(pos) {
      let c0 = findNodeFromPos(editor, pos[0]);
      let c1 = findNodeFromPos(editor, pos[1]);
      s.setBaseAndExtent(c0[0], c0[1], c1[0], c1[1]);
    },
    setCaret(pos) {
      let cursor = findNodeFromPos(editor, pos);
      s.setBaseAndExtent(cursor[0], cursor[1], cursor[0], cursor[1]);
    },
    getCursorHTML() {
      var tmp = document.createTextNode('\u0001');
      document.getSelection().getRangeAt(0).insertNode(tmp);
      var pos = editor.innerHTML.indexOf('\u0001');
      tmp.parentNode.removeChild(tmp);
      return pos;
    },
    line_pos
  }
}

// utility function for setCursor
function findNodeFromPos(parent, pos) {
  var i;
  var n = pos;

  for (i=0;i<parent.childNodes.length;i++) {
    if (parent.childNodes[i].nodeType != Node.TEXT_NODE) {
      if (parent.childNodes[i].hasChildNodes()) {
        let val = findNodeFromPos(parent.childNodes[i], n);
        if (val[0] != null) {
          return [val[0], val[1]];
        }
        else {
          n = val[1];
        }
      }
      else {
        continue;
      }
      continue;
    }

    if (n <= parent.childNodes[i].length) {
      return [parent.childNodes[i], n];
    }

    n -= parent.childNodes[i].length;
  }

  return [null, n];
}

function findAnchorFocus(s, editor) {
  let dir = (s.focusOffset >= s.anchorOffset);

  let r0 = s.getRangeAt(0);
  let r = r0.cloneRange();

  r.selectNodeContents(editor);
  r.setEnd(r0.endContainer, r0.endOffset);
  focus = (dir) ? r.toString().length : 0;
  anchor = (dir) ? 0 : r.toString().length;

  r.selectNodeContents(editor);
  r.setEnd(r0.startContainer, r0.startOffset);
  focus += (dir) ? 0: r.toString().length ;
  anchor += (dir) ? r.toString().length : 0;

  return [anchor, focus];
}

exports.Cursor = Cursor;
