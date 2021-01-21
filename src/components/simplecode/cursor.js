
class Line {
  constructor(text, pos){
    this.text = text;
    this.pos = pos;
  };
}

function Cursor(editor) {
  var start, end;
  var line_pos = [];

  if (editor.textContent == "") {
    return {};
  }

  let s = document.getSelection();
  let r0 = s.getRangeAt(0);
  let r = r0.cloneRange();

  r.selectNodeContents(editor);
  r.setEnd(r0.endContainer, r0.endOffset);
  let n = r.toString().split('\n').length;
  end = r.toString().length;

  r.selectNodeContents(editor);
  r.setEnd(r0.startContainer, r0.startOffset);
  let m = r.toString().split('\n').length;
  start = r.toString().length;

  let idx = r.toString().lastIndexOf('\n')+1;
  line_pos.push(idx);
  if (n>m) {
    var i;
    for (i=0;i<(n-m);i++) {
      idx += editor.textContent.substring(idx).indexOf('\n')+1;
      line_pos.push(idx);
    }
  }

  return {
    getSelection() {
      return [start, end];
    },
    setSelection(pos) {
      let cursor = findNodeFromPos(editor, pos[0]);
      if (pos[1] == pos[0]) {
        s.setBaseAndExtent(cursor[0], cursor[1], cursor[0], cursor[1]);
      }
      else {
        let cursor2 = findNodeFromPos(editor, pos[1]);
        s.setBaseAndExtent(cursor[0], cursor[1], cursor2[0], cursor2[1]);
      }
    },
    setCaret(pos) {
      let cursor = findNodeFromPos(editor, pos);
      s.setBaseAndExtent(cursor[0], cursor[1], cursor[0], cursor[1]);
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




function lineBeforeCursor(editor) {
  if (editor.textContent == "") {
    return "";
  }
  let r0 = document.getSelection().getRangeAt(0);
  let r = r0.cloneRange();
  r.selectNodeContents(editor);
  r.setEnd(r0.endContainer, r0.endOffset);
  line = r.toString();
  return line.substring(line.lastIndexOf('\n')+1);
}

// get absolute position in text of selected area by cursor
function getCursor(editor) {
  if (editor.textContent == "") {
    return 0;
  }
  let r0 = document.getSelection().getRangeAt(0);
  let r = r0.cloneRange();

  r.selectNodeContents(editor);
  r.setEnd(r0.endContainer, r0.endOffset);
  let end = r.toString().length;

  r.selectNodeContents(editor);
  r.setEnd(r0.startContainer, r0.startOffset);
  let start = r.toString().length;

  return [start, end];
}

function setCursor(editor, pos) {

  const s = document.getSelection();
  let cursor = findNodeFromPos(editor, pos[0]);
  if (pos[1] == pos[0]) {
    s.setBaseAndExtent(cursor[0], cursor[1], cursor[0], cursor[1]);
  }
  else {
    let cursor2 = findNodeFromPos(editor, pos[1]);
    s.setBaseAndExtent(cursor[0], cursor[1], cursor2[0], cursor2[1]);
  }
}

exports.lineBeforeCursor = lineBeforeCursor;
exports.getCursor = getCursor;
exports.setCursor = setCursor;
exports.Cursor = Cursor;
