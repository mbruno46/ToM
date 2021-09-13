function genericHighlighter(rules) {
  // we replace white space with &nbsp; only in text, not  inside <span style..>
  rules.set(/\s(?<!<span\s)/g, "&nbsp;");

  return (text) => {
    text = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    rules.forEach(function(value, key) {
      text = text.replace(key, value);
    });

    if (text=="") {
      return "<br>";
    }
    return text;
  }
}

export function Highlighter() {
  let kwrds = ['begin','end','title','author','date','section','subsection',
    'usepackage','documentclass','label'];
  let re = ''
  for (var kwrd of kwrds) {
    re += `\\\\${kwrd}`
    if (kwrd != kwrds[kwrds.length-1]) {
      re += '|'
    }
  }

  var rules = new Map([
    [/(%.*)/g, '<span class="highlight-comment">$1</span>'],
    [new RegExp(`(${re})\\[(.*?)\\]{(.*?)}`,'g'),
      '$1[<span class="highlight-square-bracket">$2</span>]{<span class="highlight-curly-bracket">$3</span>}'],
    [new RegExp(`(${re}){(.*?)}`,'g'),'$1{<span class="highlight-curly-bracket">$2</span>}'],
    [/(\\\w+)/g,'<span class="highlight-command">$1</span>'],
  ]);

  return genericHighlighter(rules);
}

export function HighlightError() {
  var rules = new Map([
    [/(! LaTeX Error)/g, '<span class="highlight-error">$1</span>'],
    [/(l\.\d+.*)/g, '<span class="highlight-error">$1</span>'],
  ]);

  return genericHighlighter(rules);
}
