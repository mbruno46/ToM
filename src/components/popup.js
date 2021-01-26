
function space(n) {
  let span = document.createElement('span');
  span.style.paddingLeft = n + 'px';
  return span;
}

function inputText(popup, args) {
  let text = document.createElement('textarea');
  text.classList.add('popup-textarea');
  text.id = "popup-inputText";
  text.value = args.defaultText;
  text.rows = args.rows;
  text.cols = args.cols;

  let cancel_btn = document.createElement('button');
  cancel_btn.classList.add('popup-btn');
  cancel_btn.textContent = "Cancel";
  cancel_btn.onclick = event => {
    popup.parentElement.removeChild(popup);
  }

  let ok_btn = document.createElement('button');
  ok_btn.id = "popup-ok-btn";
  ok_btn.classList.add('popup-btn');
  ok_btn.textContent = args.oktext;

  popup.append(text);
  popup.append(space(8));
  popup.append(cancel_btn);
  popup.append(space(8));
  popup.append(ok_btn);
}

function firePopup(xy, opts, args) {
  const div = document.createElement('div');
  div.classList.add('popup');
  div.style.width = opts.width;
  div.style.height = opts.height + 'px';

  div.style.left = xy[0] + 'px';
  div.style.top = xy[1] + 'px';

  if (args.type == 'inputText') {
    inputText(div, args);
  }
  return div;
}

exports.firePopup = firePopup;
