const {LineNumbers} = require('./linenumbers.js');
const {Cursor, lineBeforeCursor, getCursor, setCursor} = require('./cursor.js');


function loadCSS() {
  var link = document.createElement( "link" );
  link.href = "./components/simplecode/simplecode.css";
  link.type = "text/css";
  link.rel = "stylesheet";

  document.getElementsByTagName( "head" )[0].appendChild( link );
}

function highlighter(text) {
  // https://regex101.com/r/uF4oY4/1
  var replacements = new Map([
    [/(%.*)/g, '<span class="hlight-comment">$1</span>'],
    [/(\\\w+)/g,'<span class="hlight-command">$1</span>'],
    [/\{(\w+?)\}/g, '{<span class="hlight-curly-bracket">$1</span>}'],
    [/\[(\w+?)\]/g, '{<span class="hlight-square-bracket">$1</span>}']
    ])
  replacements.forEach(function(value, key) {
    text = text.replace(key, value);
  });
  return text;
}

function init(editor) {
  loadCSS();

  const css = getComputedStyle(editor);

  let isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  editor.setAttribute("contentEditable", isFirefox ? "true" : "plaintext-only");
  // editor.setAttribute("spellcheck", options.spellcheck ? "true" : "false");

  editor.textContent = "\n";
  editor.style.borderTopLeftRadius = 0
  editor.style.borderBottomLeftRadius = 0

  return LineNumbers(css);
}

function SimpleCode(editor) {
  const options = Object.assign({ tab: 4, indentOn: /{$/, spellcheck: false, addClosing: true });

  let ln = init(editor);
  let changed = false;

  // short-cut
  const on = (type, fn) => {
      editor.addEventListener(type, fn);
  };

  on("keydown", event => {
    // enter button, we prevent default behavior, since we insert
    // line break manually
    if (event.keyCode == 13) {
      newLine(event);
    }
    // tab key
    if (event.keyCode == 9) {
      event.preventDefault();
      if (event.shiftKey) {
        event.preventDefault();
        dedent();
        highlight();
      }
      else {
        insert(' '.repeat(options.tab));
      }
    }
    if (event.key == "/") {
      // Ctrl+C or Cmd+C pressed?
      if ((event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        commentCursorLine();
      }
    }
  });

  on("keyup", event => {
    if (event.defaultPrevented)
      return;
    if (event.isComposing)
      return;
    highlight();
    ln.refreshLineNumbers(getNumberOfLines());
  })

  function newLine(event) {
    let before = lineBeforeCursor(editor);

    var padding = before.indexOf(before.trim());
    if (before.indexOf('\\begin') > -1) {
      padding += options.tab;
    }

    if (padding > 0) {
      event.preventDefault();
      insert('\n' + ' '.repeat(padding));
    }
    return;
    // var line = getCurrentLine();
    // if (line.indexOf('\\begin') > -1) {
    //   let latex = line.replace(/\\begin\{(\w+?)(\b)\}/g,'$1');
    //   insert(`\n\n\\end{${latex}}`);
    // }
  }

  function dedent() {
    let before = lineBeforeCursor(editor);
    if (before.length == 0) {return;}

    let pos = getCursor(editor);
    var padding;
    if (before.trim().length == 0) {
      padding = before.length;
    }
    else {
      padding = before.indexOf(before.trim());
    }

    if (padding == 0) {return;}

    const len = Math.min(options.tab, padding);
    let idx = pos[1] - before.length;
    editor.textContent = editor.textContent.substring(0, idx) +
      editor.textContent.substring(idx + len);
    setCursor(editor, [pos[0]-len,pos[1]-len]);
  }

  function commentCursorLine() {
    let c = Cursor(editor);
    let pos = c.getSelection();

    var i;
    var shift = 0;
    for (i=0;i<c.line_pos.length;i++) {
      if (editor.textContent.substring(c.line_pos[i] + shift).match(/^\s*%/) == null) {
        c.setCaret(c.line_pos[i] + shift);
        insert('% ');
        shift += 2;
        pos[1] += 2;
        if (i==0) {pos[0]+=2;}
      }
      else {
        let ln = editor.textContent.length;
        editor.textContent = editor.textContent.substring(0,c.line_pos[i] + shift) +
          editor.textContent.substring(c.line_pos[i]+shift).replace(/^\s*%\s?/,"");
        shift += (editor.textContent.length - ln);
        if (i==0) {pos[0] += shift;}
        if (i==c.line_pos.length-1) {pos[1] += shift;}
      }
    };

    c.setSelection(pos);
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

  function highlight() {
    editor.focus();
    var pos = getCursor(editor);

    editor.innerHTML = highlighter(editor.textContent);

    editor.focus();
    setCursor(editor, pos);
  };

  function getNumberOfLines() {
    const text = editor.textContent;
    let h = text.replace(/\n$/, "\n").split("\n");
    if (h[h.length-1] == "" && h[h.length-2] == "") {
      return h.length-1;
    }
    return h.length;
  }

  return {
    setValue(text) {
      editor.textContent = text;
      highlight();
      ln.refreshLineNumbers(getNumberOfLines());
    },
    getValue() {
      return editor.textContent;
    }
  }
}

exports.SimpleCode = SimpleCode;