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

function getCursor(editor) {
  if (editor.textContent == "") {
    return 0;
  }
  let r0 = document.getSelection().getRangeAt(0);
  let r = r0.cloneRange();
  r.selectNodeContents(editor);
  r.setEnd(r0.endContainer, r0.endOffset);
  return r.toString().length;
}

function setCursor(editor, pos) {
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

  const s = document.getSelection();
  let cursor = findNodeFromPos(editor, pos);
  s.setBaseAndExtent(cursor[0], cursor[1], cursor[0], cursor[1]);
}

exports.lineBeforeCursor = lineBeforeCursor;
exports.getCursor = getCursor;
exports.setCursor = setCursor;
