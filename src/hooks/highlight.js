import latex_cmd_src from 'raw-loader!@/hooks/latex.commands';
import latex_math_src from 'raw-loader!@/hooks/latex.math';
import latex_env_src from 'raw-loader!@/hooks/latex.environments';
import {MetaData} from '@/hooks/metadata.js';
import {getAllowedExts} from '@/hooks/utils.js';

var meta = MetaData();

function parse_latex_src(data) {
  var out = [];
  data.split(/\r?\n/).forEach(e => {
    if (!e.includes('#')) {
      out.push(e.trim());
    }
  })
  return out;
}
var cmds = parse_latex_src(latex_cmd_src);
var envs = parse_latex_src(latex_env_src);
var math = parse_latex_src(latex_math_src);

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

function init_latex() {
  let re = cmds[0];
  for (var i=1;i<cmds.length;i++) re += `|\\${cmds[i]}`
  
  var rules = new Map([
    [/(%.*)/g, '<span class="highlight-comment">$1</span>'],
    [/\$(.*?)\$/g, '<span class="highlight-math">$$$1$$</span>'],
    [new RegExp(`(${re})\\[(.*?)\\]{(.*?)}`,'g'),
      '$1[<span class="highlight-square-bracket">$2</span>]{<span class="highlight-curly-bracket">$3</span>}'],
    [new RegExp(`(${re}){(.*?)}`,'g'),'$1{<span class="highlight-curly-bracket">$2</span>}'],
    [/(\\[a-zA-Z]+)/g,'<span class="highlight-command">$1</span>'],
  ]);

  return genericHighlighter(rules);
}

var LaTeXHighlighter = init_latex()
var plainHighlighter = genericHighlighter(new Map());

export default {
  LaTeXHighlighter,
  plainHighlighter,
}

export function HighlightError() {
  var rules = new Map([
    [/(! LaTeX Error)/g, '<span class="highlight-error">$1</span>'],
    [/(l\.\d+.*)/g, '<span class="highlight-error">$1</span>'],
  ]);

  return genericHighlighter(rules);
}

export function AutoComplete() {
  function _filter(list, word) {
    return list.filter(e => e.substring(0,word.length)==word)
  }

  function check(text) {
    var word, list;
    // prevent suggestions if not in the form ...\command[opts]{args
    if (text.match(/(\\\w+)$/)) {
      word = text.match(/(\\\w+)$/)[1];
      list = cmds.concat(math);
    } else if (text.match(/\\\w+(?:\[[^\]]+\])?{([^}]*)$/)) {
      let m = text.match(/(\\\w+)(?:\[[^\]]+\])?{([^}]*)$/);
      var before = m[1];
      word = m[2];
      if (before.match(/\\ref$/g)) {
        list = meta.getAllLabels();
      } else if (before.match(/\\cite$/g)){
        list = meta.getAllBibReferences();
      } else if (before.match(/(\\begin|\\end)$/g)) {
        list = envs;
      } else if (before.match(/(\\input|\\include)$/g)){
        list = meta.getAllFiles(['.tex']);
      } else if (before.match(/\\bibliography$/g)){
        list = meta.getAllFiles(['.bib']);
      } else if (before.match(/\\includegraphics$/g)){
        list = meta.getAllFiles(getAllowedExts('figure'));
      } else if (before.match(/\\cite/g)){
        list = meta.getAllBibReferences();
      } else {
        list = meta.getAllLabels().concat(meta.getAllBibReferences());
      }      
    } else {
      return {active: false};
    }

    var suggestions = (word=="") ? list : _filter(list, word);
    // no need to suggest if input already matches suggestion
    if (suggestions.length==1) {
      if (suggestions[0]==word) {
        return {active: false}
      }
    }

    return {
      filter: word, //before + ((s[2]) ? s[2] : '') + ((s[3]) ? s[3] : ''), 
      suggestions: suggestions, 
      active: (suggestions.length>0)
    };
  }

  return {
    check,
  }
}
