function LineNumbers(css) {
  let line_number_selected = 0;

  const gutter = document.createElement('div');
  gutter.classList.add('gutter');

  // Copy editor styles
  gutter.style.fontFamily = css.fontFamily
  gutter.style.fontSize = css.fontSize
  gutter.style.lineHeight = css.lineHeight
  // gutter.style.paddingTop = css.paddingTop
  // gutter.style.paddingLeft = css.paddingLeft
  gutter.style.borderTopLeftRadius = css.borderTopLeftRadius
  gutter.style.borderBottomLeftRadius = css.borderBottomLeftRadius


  function addLine() {
    let m = gutter.childNodes.length;
    const ln = document.createElement('span');
    ln.classList.add('line-number');
    ln.textContent = m+1;
    gutter.appendChild(ln);
  }

  function removeLastLine() {
    gutter.removeChild(gutter.lastElementChild);
  }

  return {
    gutter,
    selectLine(n) {
      if (line_number_selected > 0) {
        gutter.childNodes[line_number_selected].classList.remove('line-number-selected');
      }
      if (n<=gutter.childNodes.length) {
        gutter.childNodes[n].classList.add('line-number-selected');
      }
    },
    refreshLineNumbers(n) {
      let m = gutter.childNodes.length;
      while (m>n) {
        removeLastLine();
        m--;
      }
      while (m<n) {
        addLine();
        m++;
      }
    }
  };
}


exports.LineNumbers = LineNumbers;
