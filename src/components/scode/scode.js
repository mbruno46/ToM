const path = require('path');
const tex = require('./tex.js');
const {Cursor} = require('./cursor.js');
const {History} = require('./history.js');
const {Find} = require('./find.js')
const {LineNumbers} = require('./linenumbers.js');

var ntab = 4;
var timeout = 100;

function init(editor) {
  // finds css and attaches it
  var link = document.createElement( "link" );
  link.href = path.join(__dirname,"scode.css");
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName( "head" )[0].appendChild( link );

  editor.setAttribute("contentEditable", "plaintext-only");
  editor.setAttribute("spellcheck", "false");

  return LineNumbers(getComputedStyle(editor));
}


function SCode(editor) {
  let ln = init(editor);

  let currentFind = null;
  let refTime = Date.now();
  let history = History(editor);

  // short-cut
  const on = (type, fn) => {
      editor.addEventListener(type, fn);
  };


  on("keydown", event => {
    let prevent = false;

    if ((event.ctrlKey || event.metaKey)) {
      // cut,copy,paste
      if (event.key == "x") {document.execCommand('cut');}
      if (event.key == "c") {document.execCommand('copy');}
      if (event.key == "v") {document.execCommand('paste');}
      // comment
      if (event.key == "/") {
        addrmTextBeginningSelection("% ", /(^\s*)%\s?/, 'auto');
      }
      // undo/redo
      if (event.key == "z" && !event.shiftKey) {history.getPreviousState();}
      if (event.key == "y" && !event.shiftKey) {history.getNextState();}
    }

    if (event.key == "Enter") {
      prevent = true;
      newLine();
    }
    else if (event.key == "Tab") {
      prevent = true;
      regex = new RegExp(`^\\s{0,${ntab}}()`);
      addrmTextBeginningSelection(" ".repeat(ntab), regex, (event.shiftKey) ? 'rm' : 'add');
    }

    setTimeout(() => {
      sanity_check();
      refreshLineNumbers();
      highlight();
    },30);

    if (prevent) {
      event.preventDefault();
    }

    // History
    if ((Date.now() - refTime) > timeout) {
      history.recordState();
      refTime = Date.now();
    }
  });


  on("click", event => {
    highlight();
  });


  // makes sure every line ends with \n
  function sanity_check() {
    let n = editor.textContent.length;
    if (n==0) {
      editor.textContent = "\n";
      let c = Cursor(editor);
      c.setCaret(0);
    }
    else {
      let c = Cursor(editor);
      if (editor.textContent[n-1] != "\n") {
        let pos = c.getSelection();
        editor.textContent += '\n';
        c.setSelection(pos);
      }
    }
  }


  function newLine() {
    let c = Cursor(editor);
    let pos = c.getSelection();

    let tmp = editor.textContent.substring(c.line_pos[0]).match(/(^ *)(\\begin\{\w+\})?/);
    var padding = tmp[1].length;
    if (tmp[2]) {padding += ntab;}

    insert('\n');
    if (padding > 0) {
      insert(' '.repeat(padding));
    }

    c.setCaret(pos[0]+1+padding);
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
      }
    };

    c.setSelection(pos);
  }


  function highlight() {
    editor.focus();
    let c = Cursor(editor);
    let pos = c.getSelection();

    editor.innerHTML = tex.highlightText(editor.textContent);
    ln.highlightLines(c.line_numbers[0], c.line_numbers[1]);

    editor.focus();
    c.setSelection(pos);

    let pos_html = c.getCursorHTML() - 1;
    editor.innerHTML = tex.highlightBrackets(editor.innerHTML, pos_html);

    editor.focus();
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


  function refreshLineNumbers() {
    let n = editor.textContent.split("\n").length-1;
    ln.refreshLineNumbers(n);
  }


  return {
    reset() {
      editor.textContent = "\n";
      editor.focus();
      refreshLineNumbers();
    },
    setValue(text) {
      if (text == "") {
        reset();
        return;
      }
      editor.textContent = text;
      refreshLineNumbers();
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
    },
    getHistory() {
      return history;
    }
  }
}

exports.SCode = SCode;
