const {Cursor} = require('./cursor.js');

function History(editor) {
  let NMAX = 100;
  let history = [];
  var idx = -1;
  var at;

  function setState() {
    let tmp = history[idx];
    console.log(history, idx, at)
    editor.innerHTML = tmp.data;
    editor.focus();
    let c = Cursor(editor);
    c.setSelection(tmp.sel);
  }

  function checkSelections(s0,s1) {
    return (s0.startLine==s1.startLine) && (s0.startOffset==s1.startOffset) &&
      (s0.endLine==s1.endLine) && (s0.endOffset==s1.endOffset)
  }

  return {
    recordState() {
      const data = editor.innerHTML;
      let c = Cursor(editor);
      const sel = c.getSelection();

      const state = history[idx];
      if (state) {
        if (state.data == data && checkSelections(state.sel,sel)) return;
      }

      at = idx;
      at++;
      history[at] = {data, sel};

      if (at >= NMAX) {
        at = NMAX-1;
        history.splice(0,1); //removes first element
      }
      else {
        history.splice(at,history.lengt-at);
      }

      idx = at;
    },
    getPreviousState() {
      console.log(history, idx, at)
      if (idx > 0) {
        idx--;
      }
      setState();
    },
    getNextState() {
      if (idx < history.length-1) {
        idx++;
      }
      setState();
    },
    reset() {
      history = [];
      idx = -1;
    }
  }
}

exports.History = History;
