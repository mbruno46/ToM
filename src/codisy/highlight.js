var replacements = null;

function setup_highlighter() {
  // https://regex101.com/r/uF4oY4/1
  kwrds = ['begin','end','title','author','date','section','subsection',
    'usepackage','documentclass','label'];
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
    [/(\\\w+)/g,'<span class="hlight-command">$1</span>'],
    ])
}

function highlightBrackets(text, pos) {
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

function highlightText(txt) {
  if (replacements == null) {
    setup_highlighter();
  }

  replacements.forEach(function(value, key) {
    txt = txt.replace(key, value);
  });

  return txt;
}

function highlightLine(line) {
  if (replacements == null) {
    setup_highlighter();
  }

  line.innerHTML = highlightText(line.textContent);
}

exports.highlightText = highlightText;
exports.highlightLine = highlightLine;
exports.highlightBrackets = highlightBrackets;
