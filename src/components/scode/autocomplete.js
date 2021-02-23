const {Cursor} = require('./cursor.js');
const {firePopup} = require('../popup.js');

function AutoComplete(editor) {
  var tags = [];
  var biblio = [];
  let keyword = "";
  let keyword_pos = [];
  var cpos;
  var popup = null;
  var final = "";

  function search(tag) {
    return tags.filter(e => e.includes(tag));
  }

  function shouldSuggest() {
    let c = Cursor(editor);
    let pos = c.getSelection()[0];
    keyword = "";
    keyword_pos = [pos, pos];
    let m = editor.textContent.substring(0,pos).match(/{([^\{\}]*)$/);
    if (m) {
      keyword += m[1]
      keyword_pos[0] = pos - m[1].length;
    };
    m = editor.textContent.substring(pos).match(/^([^\{\}]*)}/);
    if (m) {
      keyword += m[1]
      keyword_pos[1] = pos + m[1].length;
    };
    cpos = c.pos;
    return (keyword.length==0) ? false : true;
  }

  function closePopup() {
    if (popup != null) {
      document.body.removeEventListener("keydown", eventHandler);
      popup.parentElement.removeChild(popup);
      popup = null;
    }
  }

  function eventHandler(event) {

    if (event.key == "Escape") {
      event.preventDefault();
      closePopup();
    }
    else if (event.key == "Enter") {
      event.preventDefault();

      let l = popup.children;
      for (var i=0;i<l.length;i++) {
        if (l[i].classList.contains('popup-span-selected')) {
          l[i].classList.remove('popup-span-selected');
          final = l[i].textContent;
          break;
        }
      }

      let c = Cursor(editor);
      editor.textContent = editor.textContent.substring(0,keyword_pos[0])
        + final + editor.textContent.substring(keyword_pos[1]);
      c.setCaret(keyword_pos[0] + final.length);
      closePopup();
    }
    else if (event.key == "ArrowDown") {
      event.preventDefault();

      let l = popup.children;
      let t = 0;
      for (var i=0;i<l.length;i++) {
        if (l[i].classList.contains('popup-span-selected')) {
          l[i].classList.remove('popup-span-selected');
          t = ((i+1) % l.length);
          break;
        }
      }
      l[t].classList.add('popup-span-selected');
    }
    else if (event.key == "ArrowUp") {
      event.preventDefault();

      let l = popup.children;
      let t = 0;
      for (var i=0;i<l.length;i++) {
        if (l[i].classList.contains('popup-span-selected')) {
          l[i].classList.remove('popup-span-selected');
          t = (i-1)>=0 ? i-1: l.length-1;
          break;
        }
      }
      l[t].classList.add('popup-span-selected');
    }
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
    showSuggestions(isEnter) {
      final = "";
      if (isEnter) {return;}

      closePopup();
      if (shouldSuggest()) {
        let s = search(keyword);
        opts = {width: 'auto', height: 'auto',font: getComputedStyle(editor).font};
        args = {type: 'autocomplete', suggestion: s}
        console.log(opts);
        if (s.length>0) {
          popup = firePopup([cpos.x-16,cpos.y+16], opts, args);
          document.body.append(popup);
          document.body.addEventListener("keydown", eventHandler);
        }
      }
    },
    isSuggesting() {return (popup == null) ? false : true;},
    finalChoice() {return final;}
  }
}

exports.AutoComplete = AutoComplete;
