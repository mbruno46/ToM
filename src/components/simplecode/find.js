function Find(text, _word) {
  let word = _word;
  let pos = [];
  var n = 0;

  _pos = 0;
  while (_pos < text.length) {
    let idx = text.substring(_pos).indexOf(word);
    if (idx < 0) {
      break;
    }
    else {
      pos.push(_pos + idx);
      _pos += idx + word.length;
    }
  }

  return {
    getWord() {
      return word;
    },
    findNext() {
      var out = pos[n];
      n++;
      if (n==pos.length) {
        n=0;
      }
      return out;
    }
  }
}

exports.Find = Find;
