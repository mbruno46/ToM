const path = require('path');
const hlight = require('./highlight.js');
const {Cursor} = require('./cursor.js');
const {History} = require('./history.js');
// const {Find} = require('./find.js')
// const {LineNumbers} = require('./linenumbers.js');
// const {AutoComplete} = require('./autocomplete.js');


var ntab = 4;
var timeout = 100;


function init(editor) {
  // finds css and attaches it
  var link = document.createElement( "link" );
  link.href = path.join(__dirname,"codisy.css");
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName( "head" )[0].appendChild( link );

  editor.setAttribute("contentEditable", "plaintext-only");
  editor.setAttribute("spellcheck", "false");

  return true;
  // return LineNumbers(getComputedStyle(editor));
}


function newLine(text = '\n') {
  let l = document.createElement('div');
  l.setAttribute('line','');
  if (!text.match(/\n$/g)) {text += '\n'}
  l.appendChild(document.createTextNode(text));
  return l;
}


function findPadding(text) {
  let tmp = text.match(/(^ *)(\\begin\{.*\})?/);
  return tmp[1].length;
}


function Codisy(editor) {
  let ln = init(editor);

  let currentFind = null;
  let refTime = Date.now();
  let history = History(editor);
  // let ac = AutoComplete(editor);


  // short-cut
  const on = (type, fn) => {
      editor.addEventListener(type, fn);
  };

  function isUndoRedo(event) {
    if ((event.ctrlKey || event.metaKey)) {
      if (event.key == "z" || event.key == "y") {return true;}
    }
    return false;
  }


  on("keydown", event => {
    let prevent = false;
    let shouldRecord = true;

    if ((event.ctrlKey || event.metaKey)) {
      shouldRecord = false;
      if (event.key == '/') {
        shouldRecord = true;
        let l = Cursor(editor).getLines();
        if (l[0].textContent.match(/^\s*% /g)) {
          insertBeginningLine(/% ?/, true);
        }
        else {
          insertBeginningLine('% ', false);
        }
      }
      // undo/redo
      if (event.key == "z" && !event.shiftKey) {history.getPreviousState();}
      if (event.key == "y" && !event.shiftKey) {history.getNextState();}
    }

    if (event.key == "Enter") {
      prevent = true;
      handleNewLine();
    }
    else if (event.key == "Tab") {
      prevent = true;
      if (event.shiftKey) {
        insertBeginningLine(new RegExp(`^\\s{0,${ntab}}`), true)
      }
      else {
        insertBeginningLine(' '.repeat(ntab), false)
      }
    }

    if (prevent) {
      event.preventDefault();
    }


  });

  on('keyup', event => {
    // highlight();

    // History
    if ((Date.now() - refTime) > timeout) {
      if (!isUndoRedo(event)) {
        history.recordState();
        refTime = Date.now();
      }
    }
  })


  function reset(record=false) {
    editor.textContent = "";
    editor.appendChild(newLine());
    editor.focus();
    // refreshLineNumbers();
    history.reset();
    if (record) {history.recordState();}
  }


  function handleNewLine() {
    let c = Cursor(editor);
    if (c.isRange()) {run('delete')};
    let [current] = c.getLines();
    let txt = current.textContent
    var p = findPadding(txt);
    let pos = c.getPosition();
    current.textContent = txt.substring(0,pos) + '\n';
    let n = newLine(' '.repeat(p) + txt.substring(pos));
    editor.insertBefore(n,current.nextSibling);
    c.setCaretAtLine(n, p);
  }


  function insertBeginningLine(txt, rm=false) {
    let c = Cursor(editor);
    let l = c.getLines();
    let s = c.getSelection();

    for (var i=0;i<l.length;i++) {
      var shift;
      if (!rm) {
        l[i].textContent = txt + l[i].textContent;
        shift = txt.length;
      }
      else {
        shift = -l[i].textContent.length;
        l[i].textContent = l[i].textContent.replace(txt,'')
        shift += l[i].textContent.length;
      }
      if (i==0) {s.startOffset += shift}
      if (i==l.length-1) {s.endOffset += shift}
    }
    c.setSelection(s);
  }


  function highlight(full=false) {
    let c = Cursor(editor);
    c.save();
    if (!full) {
      let l = c.getLines();
      for (var i=0;i<l.length;i++) {
        hlight.highlightLine(l[i]);
      }
    }
    c.restore();
  }


  function run(cmd) {
    document.execCommand(cmd, false, true);
  }


  return {
    reset,
    setValue(input) {
      reset();
      lines = input.split('\n');
      for (var i=0;i<lines.length;i++) {
        let l = newLine(lines[i])
        editor.appendChild(l);
        hlight.highlightLine(l)
      }
    },
    getValue() {
      return editor.textContent;
    },
    getHistory() {
      return history;
    }
  }
}

exports.Codisy = Codisy;
