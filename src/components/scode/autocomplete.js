const {Cursor} = require('./cursor.js');


function AutoComplete(editor) {
  var tags = [];
  var biblio = [];
  let suggesting = "";

  function search(tag) {
    return tags.filter(e => e.includes(tag));
  }

  function checkSuggesting() {
    let c = Cursor(editor);
    let pos = c.getSelection()[0];
    suggesting = "";
    let m = editor.textContent.substring(0,pos).match(/{([^\{\}]*)$/);
    if (m) {suggesting += m[1]};
    m = editor.textContent.substring(pos).match(/^([^\{\}]*)}/);
    if (m) {suggesting += m[1]};
  }


  return {
    refreshTags() {
      tags = [];
      let m = Array.from(editor.textContent.matchAll(/\\label{(.*)}/g));
      for (var i=0;i<m.length;i++) {
        tags.push(m[i][1]);
      }
    },
    refreshBiblio() {
      biblio = [];
    },
    showSuggestions() {
      checkSuggesting();
      console.log('sugg', suggesting, search(suggesting));
    }
  }
}

exports.AutoComplete = AutoComplete;
