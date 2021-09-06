export function Highlighter() {
  var rules = new Map([
    [/(%.*)/g, '<span class="highlight-comment">$1</span>'],
    [/(\\\w+)/g,'<span class="highlight-command">$1</span>'],
  ]);

  function run(text) {
    console.log(text);
    rules.forEach(function(value, key) {
      text = text.replace(key, value);
    });
  
    if (text=="") {
      return "<br>";
    }
    return text;
  }

  return {
    run
  }
}