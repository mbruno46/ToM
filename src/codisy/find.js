function Find(lines, _word) {
  let word = _word;
  let found = [];
  var n = 0;

  for (var i=0;i<lines.length;i++) {
    let idx = lines[i].textContent.indexOf(word);
    if (idx < 0) {
      continue;
    }
    else {
      found.push({line: i, pos: idx});
    }
  }

  return {
    getWord() {
      return word;
    },
    findNext() {
      var out = found[n];
      n++;
      if (n==found.length) {
        n=0;
      }
      return out;
    }
  }
}

exports.Find = Find;
