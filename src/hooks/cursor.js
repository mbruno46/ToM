import utils from './utils'

export function Cursor(editor) {
  var anchor, focus;
  let s = document.getSelection();

  function getLinePos(node, offset) {
    let line = getLine(node);
    let r = new Range();
    r.selectNodeContents(line);
    r.setEnd(node, offset);
    return [line, r.toString().length];
  }

  function getLine(node = s.anchorNode) {
    if (node.nodeName == "DIV") {
      return utils.getParentByAttr(node, 'single-line');
    }
    return utils.getParentByAttr(node.parentElement, 'single-line');
  }


  function findLineNodeFromPos(parent, pos) {
    var _pos = pos;
    var cnode = null;
    
    if (pos==0) {
      return [parent, pos]
    }

    if (parent.hasChildNodes()) {
      for (var i=0 ; i<parent.childNodes.length ; i++) {
        cnode = parent.childNodes[i];
        if (cnode.nodeType != Node.TEXT_NODE) {
          [cnode, _pos] = findLineNodeFromPos(cnode, _pos);
          if (cnode != null) {
            return [cnode, _pos];
          }
        } else {
          var n = cnode.length;
          if  (_pos <= n) {
            return [cnode, _pos];
          } else {
            _pos -= n;
          }
        }
      }
    }
    return [null, _pos];
  }

  return {
    getLine,
    save() {
      anchor = getLinePos(s.anchorNode, s.anchorOffset);
      focus = getLinePos(s.focusNode, s.focusOffset);
    },
    getSelectedLines() {
      anchor = getLinePos(s.anchorNode, s.anchorOffset);
      focus = getLinePos(s.focusNode, s.focusOffset);
      var i0 = Array.prototype.indexOf.call(editor.children, anchor[0]);
      var i1 = Array.prototype.indexOf.call(editor.children, focus[0]);
      // var i0 = editor.children.indexOf(anchor[0]);
      // var i1 = editor.children.indexOf(focus[0]);
      if (i0<i1) {
        return [i0,i1];
      }
      return [i1,i0];
    },
    restore(shift0=0,shift1=0) {
      let c0 = findLineNodeFromPos(anchor[0], anchor[1] + shift0);
      let c1 = findLineNodeFromPos(focus[0], focus[1] + shift1);
      s.setBaseAndExtent(c0[0], c0[1], c1[0], c1[1]);
    }
  }
}