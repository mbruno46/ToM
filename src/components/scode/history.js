const {Cursor} = require('./cursor.js');

function History(editor) {
  let NMAX = 100;
  let history = [];
  var idx;
  let at = -1;

  function setState() {
    let tmp = history[idx];
    editor.innerHTML = tmp.data;
    editor.focus();
    let c = Cursor(editor);
    c.setSelection(tmp.pos);
  }

  return {
    recordState() {
      const data = editor.innerHTML;
      let c = Cursor(editor);
      const pos = c.getSelection();

      const state = history[idx];
      if (state) {
        if (state.data == data && state.pos[0] == pos[0]
          && state.pos[1] == pos[1]) return;
      }

      at++;
      history[at] = {data, pos};
      history.splice(at+1); // like allocation

      if (at > NMAX) {
        at = -1;
        history.splice(0,1);
      }

      idx = at;
    },
    getPreviousState() {
      if (idx > 0) {
        idx--;
      }
      setState();
    },
    getNextState() {
      if (idx < at) {
        idx++;
      }
      setState();
    },
    reset() {
      history = [];
      at = -1;
    }
  }
}

exports.History = History;
