function LineNumbers(css) {
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
      for (var i=0;i<gutter.children.length;i++) {
        if ((i>=i0-1) && (i<=i1-1)) {
          if (!gutter.children[i].classList.contains('line-number-selected')) {
            gutter.children[i].classList.add('line-number-selected');
          }
        }
        else {
          gutter.children[i].classList.remove('line-number-selected');
        }
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
