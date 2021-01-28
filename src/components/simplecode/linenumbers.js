function LineNumbers(css) {
  let line_number_selected = [];

  const gutter = document.getElementById('gutter');
  gutter.classList.add('gutter');

  // Copy editor styles
  gutter.style.fontFamily = css.fontFamily
  gutter.style.fontSize = css.fontSize
  gutter.style.lineHeight = css.lineHeight
  // gutter.style.paddingTop = css.paddingTop
  // gutter.style.paddingLeft = css.paddingLeft
  gutter.style.borderTopLeftRadius = css.borderTopRightRadius
  gutter.style.borderBottomLeftRadius = css.borderBottomRightRadius


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
    highlightLines(i0, i1) {
      var i;
      for (i=0;i<gutter.children.length;i++) {
        gutter.children[i].classList.remove('line-number-selected');
      }
      try {
        for (i=i0;i<=i1;i++) {
          gutter.children[i-1].classList.add('line-number-selected');
        }
      } catch {
        console.log(i0,i1,gutter.children.length);
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
      return true;
    }
  };
}


exports.LineNumbers = LineNumbers;
