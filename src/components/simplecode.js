function highlighter(text) {
  return text
    .replace(/(\\\w+)/g,'<font style="color: var(--yellow)">$1</font>');
    // .replace(/\\begin\{(\w+?)\})/g,'<font style="color: var(--green)">$1</font>');
}

function SimpleCode(editor) {
  const options = Object.assign({ tab: "\t", indentOn: /{$/, spellcheck: false, addClosing: true });

  let isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  editor.setAttribute("contentEditable", isFirefox ? "true" : "plaintext-only");
  editor.setAttribute("spellcheck", options.spellcheck ? "true" : "false");
  editor.style.outline = "none";
  editor.style.overflowWrap = "break-word";
  editor.style.overflowY = "auto";
  editor.style.resize = "none";
  editor.style.whiteSpace = "pre-wrap";
  editor.textContent = "";

  // short-cut
  const on = (type, fn) => {
      editor.addEventListener(type, fn);
  };

  on("keypress", event => {
    if (event.defaultPrevented)
      return;
    // // Enter button
    // if (event.keyCode == 13) {
    //   event.preventDefault();
    //   newLine();
    // }
    // var pos = getCursor();
    // highlight();

  });

  on("keyup", event => {
    if (event.defaultPrevented)
      return;
    if (event.isComposing)
      return;
    highlight();
  })

  function newLine() {
    var line = getCurrentLine();
    if (line.indexOf('\\begin') > -1) {
      let latex = line.replace(/\\begin\{(\w+?)(\b)\}/g,'$1');
      insert(`\n\n\\end{${latex}}`);
    }
  }

  function getCurrentLine() {
    const s = window.getSelection();
    const r0 = s.getRangeAt(0);
    const r = document.createRange();
    r.selectNodeContents(editor);
    r.setEnd(r0.startContainer, r0.startOffset);
    line = r.toString();
    return line.substring(line.lastIndexOf('\n')+1);
  }

  function beforeCursor() {
      const s = window.getSelection();
      const r0 = s.getRangeAt(0);
      const r = document.createRange();
      r.selectNodeContents(editor);
      r.setEnd(r0.startContainer, r0.startOffset);
      return r.toString();
  }

  function afterCursor() {
      const s = window.getSelection();
      const r0 = s.getRangeAt(0);
      const r = document.createRange();
      r.selectNodeContents(editor);
      r.setStart(r0.endContainer, r0.endOffset);
      return r.toString();
  }

  function insert(text) {
      text = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      document.execCommand("insertHTML", false, text);
  };

  function getCursor() {
    let r0 = document.getSelection().getRangeAt(0);
    let r = r0.cloneRange();
    r.selectNodeContents(editor);
    r.setEnd(r0.endContainer, r0.endOffset);
    return r.toString().length;
  }

  function findNode(parent, pos) {
    var i;
    var n = pos;

    for (i=0;i<parent.childNodes.length;i++) {
      if (parent.childNodes[i].nodeType != Node.TEXT_NODE) {
        if (parent.childNodes[i].hasChildNodes()) {
          let val = findNode(parent.childNodes[i], n);
          console.log('after', val);
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

  function setCursor(cursor) {
    const s = document.getSelection();
    s.setBaseAndExtent(cursor[0], cursor[1], cursor[0], cursor[1]);
  }

  function highlight() {
    var pos = getCursor();

    editor.innerHTML = highlighter(editor.textContent);

    editor.focus();
    setCursor(findNode(editor, pos));
  };

  return {
    setValue(text) {
      editor.textContent = text;
      highlight();
    }
  }
}

exports.SimpleCode = SimpleCode;
