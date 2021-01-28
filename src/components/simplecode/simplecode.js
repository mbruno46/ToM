const {LineNumbers} = require('./linenumbers.js');
const {Cursor} = require('./cursor.js');
const {Find} = require('./find.js')

function loadCSS() {
  var link = document.createElement( "link" );
  link.href = "./components/simplecode/simplecode.css";
  link.type = "text/css";
  link.rel = "stylesheet";

  document.getElementsByTagName( "head" )[0].appendChild( link );
}

var replacements = null;

function setup_highlighter() {
  // https://regex101.com/r/uF4oY4/1
  kwrds = ['begin','end','title','author','date','section','subsection',
    'usepackage','documentclass'];
  re = ''
  for (kwrd of kwrds) {
    re += `(?:\\\\${kwrd})`
    if (kwrd != kwrds[kwrds.length-1]) {
      re += '|'
    }
  }
  replacements = new Map([
    [/(%.*)/g, '<span class="hlight-comment">$1</span>'],
    [new RegExp(`(${re})\\[(.*?)\\]\{(.*?)\}`,'g'),
      '$1[<span class="hlight-square-bracket">$2</span>]{<span class="hlight-curly-bracket">$3</span>}'],
    [new RegExp(`(${re})\{(.*?)\}`,'g'),
      '$1{<span class="hlight-curly-bracket">$2</span>}'],
    // [/(\\\w+)\[(.+?)\]\{(.+?)\}/g, '$1[<span class="hlight-square-bracket">$2</span>]{<span class="hlight-curly-bracket">$3</span>}'],
    // [/\[(.+?)\]/g, '{<span class="hlight-square-bracket">$1</span>}']
    [/(\\\w+)/g,'<span class="hlight-command">$1</span>'],
    ])
}

function highlight_brackets(text, pos) {
  var b = null;
  if (text[pos]=='\{') {
    b = posClosingBracket(text, pos, +1, ['\{','\}']);
  }
  if (text[pos]=='\}') {
    b = posClosingBracket(text, pos, -1, ['\{','\}']);
  }
  if (text[pos]=='\[') {
    b = posClosingBracket(text, pos, +1, ['\[','\]']);
  }
  if (text[pos]=='\]') {
    b = posClosingBracket(text, pos, -1, ['\[','\]']);
  }
  if (text[pos]=='\(') {
    b = posClosingBracket(text, pos, +1, ['\(','\)']);
  }
  if (text[pos]=='\)') {
    b = posClosingBracket(text, pos, -1, ['\(','\)']);
  }

  if (b != null) {
    let i0 = Math.min(b, pos);
    let i1 = Math.max(b, pos);
    text = text.substring(0,i0) + `<span class="hlight-bracket">${text[i0]}</span>` +
      text.substring(i0+1,i1) + `<span class="hlight-bracket">${text[i1]}</span>` +
      text.substring(i1+1);
  }

  function posClosingBracket(text, start, dir, match) {
    var i, n;
    n = 0;
    for (i=start; (dir>0) ? (i<text.length) : (i>0);i+=dir) {
      if (text[i] == match[0]) {
        n++;
      }
      if (text[i] == match[1]) {
        n--;
      }
      if (n==0) {
        return i;
      }
    }
    return null;
  }

  return text;
};

function highlighter(text, pos) {
  if (replacements == null) {
    setup_highlighter();
  }

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
  editor.setAttribute("spellcheck", "true");

  editor.style.borderTopLeftRadius = 0
  editor.style.borderBottomLeftRadius = 0

  return LineNumbers(css);
}

function SimpleCode(editor) {
  const options = Object.assign({tab: 4});

  let ln = init(editor);
  let changed = false;
  let currentFind = null;

  // short-cut
  const on = (type, fn) => {
      editor.addEventListener(type, fn);
  };

  on("keydown", event => {
    // enter button, we prevent default behavior, since we insert
    // line break manually
    if (event.key == "Enter") {
      event.returnValue = newLine();
    }
    // tab key
    if (event.key == "Tab") {
      event.preventDefault();
      regex = new RegExp(`^\\s{0,${options.tab}}()`);
      if (event.shiftKey) {
        event.preventDefault();
        addrmTextBeginningSelection(" ".repeat(options.tab), regex, 'rm');
      }
      else {
        addrmTextBeginningSelection(" ".repeat(options.tab), regex, 'add');
      }
    }
    if (event.key == "/") {
      // Ctrl+C or Cmd+C pressed?
      if ((event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        addrmTextBeginningSelection("% ", /(^\s*)%\s?/, 'auto');
      }
    }
    // cut,copy,paste
    if (event.key == "x")
      if ((event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        document.execCommand('cut');
      }
    if (event.key == "c")
      if ((event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        document.execCommand('copy');
      }
    if (event.key == "v")
      if ((event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        document.execCommand('paste');
      }
    // ln.refreshLineNumbers(getNumberOfLines());
    // highlight();
  });

  on("keyup", event => {
    if (editor.textContent == "")
      editor.textContent += '\n';
    if (event.defaultPrevented)
      return;
    if (event.isComposing)
      return;
    ln.refreshLineNumbers(getNumberOfLines());
    highlight();
  })

  on("click", event => {
    highlight();
  })

  function newLine() {
    let c = Cursor(editor);
    let pos = c.getSelection();

    let tmp = editor.textContent.substring(c.line_pos[0]).match(/(^ *)(\\begin\{\w+\})?/);
    var padding = tmp[1].length;
    if (tmp[2]) {padding += options.tab;}

    insert('\n');
    if (padding > 0) {
      insert(' '.repeat(padding));
    }

    c.setCaret(pos[0]+1+padding);
    return false;
  }


  function addrmTextBeginningSelection(text, regex, addrm) {
    let c = Cursor(editor);
    let pos = c.getSelection();

    var i;
    var rm = 0;
    if (addrm == 'auto') {
      for (i=0;i<c.line_pos.length;i++) {
        if (editor.textContent.substring(c.line_pos[i]).match(regex) != null) {
          rm += 1;
        }
      }
    }
    if (addrm == 'rm') {
      rm = c.line_pos.length;
    }

    var shift = 0;
    for (i=0;i<c.line_pos.length;i++) {
      if (rm != c.line_pos.length) {
        c.setCaret(c.line_pos[i] + shift);
        insert(text);
        shift += text.length;
        // pos[1] += text.length;
        if (i==0) {pos[0]+=text.length;}
        if (i==c.line_pos.length-1) {pos[1] += shift;}
      }
      else {
        let ln = editor.textContent.length;
        editor.textContent = editor.textContent.substring(0,c.line_pos[i] + shift) +
          editor.textContent.substring(c.line_pos[i]+shift).replace(regex,"$1");
        shift += (editor.textContent.length - ln);
        if (i==0) {pos[0] += shift;}
        if (i==c.line_pos.length-1) {pos[1] += shift;}
        highlight();
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
    let c = Cursor(editor);
    let pos = c.getSelection();

    editor.innerHTML = highlighter(editor.textContent, pos[1]);

    let i0 = editor.textContent.substring(0,pos[0]).split('\n').length;
    let i1 = editor.textContent.substring(pos[0], pos[1]).split('\n').length - 1;
    ln.highlightLines(i0, i0+i1);

    editor.focus();
    c.setSelection(pos);

    let pos_html = c.getCursorHTML() - 1;
    editor.innerHTML = highlight_brackets(editor.innerHTML, pos_html);

    editor.focus();
    c.setSelection(pos);
  };

  function getNumberOfLines() {
    // sanity check
    let c = Cursor(editor);
    let pos = c.getSelection();
    if (editor.textContent[editor.textContent.length-1] != '\n') {
      editor.textContent += '\n';
    }
    c.setSelection(pos);

    const text = editor.textContent;
    return text.split("\n").length-1;
  }


  return {
    reset() {
      editor.textContent = "\n";
      editor.focus();
      ln.refreshLineNumbers(getNumberOfLines());
    },
    setValue(text) {
      if (text == "") {
        reset();
        return;
      }
      editor.textContent = text;
      ln.refreshLineNumbers(getNumberOfLines());
      highlight();
    },
    getValue() {
      return editor.textContent;
    },
    findNext(word) {
      if (currentFind==null || currentFind.getWord() != word) {
        currentFind = Find(editor.textContent, word);
      }
      pos = currentFind.findNext();
      let c = Cursor(editor);

      editor.focus();
      c.setSelection([pos,pos+word.length]);
    }
  }
}

exports.SimpleCode = SimpleCode;
