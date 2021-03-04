function Cursor(editor) {
  var range;
  var cache;

  function isRange() {
    return document.getSelection().type == 'Range'
  }


  function getLines(indices = false) {
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
    var i1 = Array.prototype.indexOf.call(editor.childNodes, end);
    var lines = []
    for (var i=i0;i<=i1;i++) {
      if (!indices) {
        lines.push(editor.childNodes[i])
      }
      else {
        lines.push(i);
      }
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
    let lid = getLines(true);
    let r = range.cloneRange();
    var out = {};

    r.selectNodeContents(editor.childNodes[lid[lid.length-1]]);
    r.setEnd(range.endContainer, range.endOffset);
    out.endLine = lid[lid.length-1];
    out.endOffset = r.toString().length;

    r.selectNodeContents(editor.childNodes[lid[0]]);
    r.setEnd(range.startContainer, range.startOffset);
    out.startLine = lid[0];
    out.startOffset = r.toString().length;

    return out;
  }


  function setSelection(inp) {
    let [n0, p0] = findNodeFromPos(editor.childNodes[inp.startLine], inp.startOffset);
    let [n1, p1] = findNodeFromPos(editor.childNodes[inp.endLine], inp.endOffset);
    document.getSelection().setBaseAndExtent(n0, p0, n1, p1);
  }

  return {
    save() {
      cache = getSelection();
    },
    restore() {
      setSelection(cache);
    },
    isRange,
    setCaretAtLine(line, pos) {
      [node, p] = findNodeFromPos(line, pos);
      document.getSelection().setBaseAndExtent(node, p, node, p);
    },
    getLines,
    getPosition,
    getSelection,
    setSelection,
    createSelection(i0, pos0, i1=null, pos1=null) {
      var out = {};
      out.startLine = i0;
      out.startOffset = pos0;
      if (i1==null && pos1==null) {
        out.endLine = out.startLine;
        out.endOffset = out.startOffset;
      }
      else {
        out.endLine = i1;
        out.endOffset = pos1;
      }
      return out;
    }
  }
}


// utility function for setCursor
function findNodeFromPos(node, pos) {
  if (node.nodeType == Node.TEXT_NODE) {
    if (pos <= node.length) {
      return [node, pos];
    }
    else {
      return [null, pos - node.length]
    }
  }
  else {
    if (node.hasChildNodes()) {
      var n = pos;
      for (var i=0;i<node.childNodes.length;i++) {
        let val = findNodeFromPos(node.childNodes[i], n);
        if (val[0]==null) {
          n = val[1];
        }
        else {
          return val;
        }
      }
      return [null, n];
    }
    return [null, pos];
  }
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
