function Cursor(editor) {
  var range;
  var cache;

  function isRange() {
    return document.getSelection().type == 'Range'
  }


  function getLines() {
    let s = document.getSelection();
    range = s.getRangeAt(0);

    function findLine(element) {
      if (element.nodeName == '#text') {
        return findLine(element.parentElement);
      }
      else {
        if (!element.hasAttribute('line')) {
          return findLine(element.parentElement)
        }
        else {
          return element;
        }
      }
    }

    var start = findLine(range.startContainer);
    if (!isRange) {return [start];}

    var end = findLine(range.endContainer);
    var i0 = Array.prototype.indexOf.call(editor.childNodes, start);
    var i1 = Array.prototype.indexOf.call(editor.childNodes, findLine(range.endContainer));
    var lines = []
    for (var i=i0;i<=i1;i++) {
      lines.push(editor.childNodes[i])
    }
    return lines;
  }


  function getPosition() {
    let l = getLines();
    let r = range.cloneRange();

    r.selectNodeContents(l[l.length-1]);
    r.setEnd(range.endContainer, range.endOffset);
    return r.toString().length;
  }


  function getSelection() {
    let l = getLines();
    let r = range.cloneRange();
    var out = {};

    r.selectNodeContents(l[l.length-1]);
    r.setEnd(range.endContainer, range.endOffset);
    out.endLine = l[l.length-1];
    out.endOffset = r.toString().length;

    r.selectNodeContents(l[0]);
    r.setEnd(range.startContainer, range.startOffset);
    out.startLine = l[0];
    out.startOffset = r.toString().length;

    return out;
  }

  return {
    save() {
      cache = document.getSelection().getRangeAt(0);
    },
    restore() {
      let s = document.getSelection();
      s.removeAllRanges();
      s.addRange(cache);
      // [n0, p0] = findNodeFromPos(cache.startContainer, cache.startOffset);
      // [n1, p1] = findNodeFromPos(cache.endContainer, cache.endOffset);
      // console.log(n0,p0,n1,p1,cache)
      // document.getSelection().setBaseAndExtent(n0, p0, n1, p1);
    },
    isRange,
    setCaretAtLine(line, pos) {
      [node, p] = findNodeFromPos(line, pos);
      document.getSelection().setBaseAndExtent(node, p, node, p);
    },
    getLines,
    getPosition,
    getSelection,
    setSelection(inp) {
      [n0, p0] = findNodeFromPos(inp.startLine, inp.startOffset);
      [n1, p1] = findNodeFromPos(inp.endLine, inp.endOffset);
      document.getSelection().setBaseAndExtent(n0, p0, n1, p1);
    }
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
  let rect = r0.getClientRects()[0];
  let r = r0.cloneRange();

  r.selectNodeContents(editor);
  r.setEnd(r0.endContainer, r0.endOffset);
  focus = (dir) ? r.toString().length : 0;
  anchor = (dir) ? 0 : r.toString().length;

  r.selectNodeContents(editor);
  r.setEnd(r0.startContainer, r0.startOffset);
  focus += (dir) ? 0: r.toString().length ;
  anchor += (dir) ? r.toString().length : 0;

  return [anchor, focus, {x: rect.left, y: rect.top}];
}

exports.Cursor = Cursor;
