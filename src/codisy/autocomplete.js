const {Cursor} = require('./cursor.js');
const hlight = require('./highlight.js');

function firePopup(xy, opts,suggestion) {
  const div = document.createElement('div');
  div.classList.add('autocomplete');
  div.style.width = opts.width;
  div.style.height = opts.height;
  if ('font' in opts) {
    div.style.font = opts.font;
  }

  div.style.left = xy[0] + 'px';
  div.style.top = xy[1] + 'px';

  div.style.display = 'flex';
  div.style.flexFlow = 'column';

  for (var i=0;i<suggestion.length;i++) {
    let span = document.createElement('span');
    span.textContent = suggestion[i];
    span.style.textAlign = 'left';
    div.append(span);
  }
  return div;
}

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
    keyword = "";

    if (c.isRange()) {return false;}

    let s = c.getSelection();
    keyword_pos = [s.startOffset, s.startOffset];
    let line = editor.childNodes[s.startLine];
    let m = line.textContent.substring(0,s.startOffset).match(/{([^\{\}]*)$/);
    if (m) {
      keyword += m[1]
      keyword_pos[0] = s.startOffset - m[1].length;
    };
    m = line.textContent.substring(s.startOffset).match(/^([^\{\}]*)}/);
    if (m) {
      keyword += m[1]
      keyword_pos[1] = s.startOffset + m[1].length;
    };
    cpos = c.getXY();
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
        if (l[i].classList.contains('ac-span-selected')) {
          l[i].classList.remove('ac-span-selected');
          final = l[i].textContent;
          break;
        }
      }

      let c = Cursor(editor);
      let line = editor.childNodes[c.getSelection().startLine];
      let newline = line.textContent.substring(0,keyword_pos[0])
        + final + line.textContent.substring(keyword_pos[1]);
      line.innerHTML = hlight.highlightText(newline);
      c.setCaretAtLine(line,keyword_pos[0] + final.length);
      closePopup();
    }
    else if (event.key == "ArrowUp" || event.key == "ArrowDown") {
      event.preventDefault();

      let l = popup.children;
      let t = 0;
      for (var i=0;i<l.length;i++) {
        if (l[i].classList.contains('ac-span-selected')) {
          l[i].classList.remove('ac-span-selected');
          if (event.key == "ArrowDown") {
            t = ((i+1) % l.length);
          }
          else {
            t = (i-1)>=0 ? i-1: l.length-1;
          }
          break;
        }
      }
      l[t].classList.add('ac-span-selected');
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
    reset() {closePopup();},
    showSuggestions(isEnter) {
      final = "";
      if (isEnter) {return;}

      closePopup();
      if (shouldSuggest()) {
        let suggestion = search(keyword);
        opts = {width: 'auto', height: 'auto',font: getComputedStyle(editor).font};
        if (suggestion.length>0) {
          popup = firePopup([cpos.x-16,cpos.y+16], opts, suggestion);
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
