import utils from './utils'

export function Cursor(editor) {
  var anchor = getLinePos(editor.children[0], 0);
  var focus = getLinePos(editor.children[0], 0);
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
      var i0 = utils.getIndexOf(editor.children, anchor[0]);
      var i1 = utils.getIndexOf(editor.children, focus[0]);
      if (i0<i1) {
        return [i0,i1];
      }
      return [i1,i0];
    },
    restore(shift0=0,shift1=0) {
      let c0 = findLineNodeFromPos(anchor[0], anchor[1] + shift0);
      let c1 = findLineNodeFromPos(focus[0], focus[1] + shift1);
      s.setBaseAndExtent(c0[0], c0[1], c1[0], c1[1]);
    },
    getSelectedText() {
      this.save();
      var i0 = utils.getIndexOf(editor.children, anchor[0]);
      var i1 = utils.getIndexOf(editor.children, focus[0]);
      var text;
      if (i0==i1) {
        let min = Math.min(anchor[1], focus[1]);
        let max = Math.max(anchor[1], focus[1]);
        text = anchor[0].textContent.substring(min, max);
      } else if (i0<i1) {
        text = anchor[0].textContent.substring(anchor[1]);
        for (let i=i0+1;i<i1;i++) {
          text += `\n${editor.children[i].textContent}`;
        }
        text += `\n${focus[0].textContent.substring(0, focus[1])}`;
      } else if (i0>i1) {
        text = [focus[0].textContent.substring(focus[1])];
        for (let i=i0+1;i<i1;i++) {
          text += `\n${editor.children[i].textContent}`
        }
        text += `\n${anchor[0].textContent.substring(0, anchor[1])}`
      }
      return text;
    },
    getCaret() {
      if (s.anchorNode == s.focusNode) {
        if (s.anchorOffset == s.focusOffset) {
          anchor = getLinePos(s.anchorNode, s.anchorOffset);
          var i0 = utils.getIndexOf(editor.children, anchor[0]);
          let r0 = s.getRangeAt(0);
          var rect = {left: 0, top: 0};
          if (r0.getClientRects().length>0) {
            rect = r0.getClientRects()[0];
          }
          return {index: i0, pos: anchor[1], x: rect.left, y: rect.top};
        }
      }
      return null;
    },
    setCaret(line, pos, len=null) {
      let c0 = findLineNodeFromPos(line, pos);
      if (len!=null) {
        let c1 = findLineNodeFromPos(line, pos+len);
        s.setBaseAndExtent(c0[0], c0[1], c1[0], c1[1]);
        return;
      }
      s.setBaseAndExtent(c0[0], c0[1], c0[0], c0[1]);
    },
    getRange() {
      if (s.rangeCount>0) {
        return s.getRangeAt(0);
      } else {
        return new Range();
      }
    },
    setRange(r) {
      s.removeAllRanges();
      s.addRange(r);
    },
  }
}