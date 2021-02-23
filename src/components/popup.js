
function space(n) {
  let span = document.createElement('span');
  span.style.paddingLeft = n + 'px';
  return span;
}

function vspace(n) {
  let span = document.createElement('span');
  span.style.paddingTop = n + 'px';
  return span;
}

function inputText(popup, args) {
  let text = document.createElement('textarea');
  text.classList.add('popup-textarea');
  text.id = "popup-inputText";
  text.value = args.defaultText;
  text.rows = args.rows;
  text.cols = args.cols;
  text.addEventListener("keydown", event => {
    if (event.key == "Enter") {event.preventDefault();}
  });

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

function log(popup, args) {
  popup.style.display = 'flex';
  popup.style.flexFlow = 'column';

  let span = document.createElement('span');
  span.textContent = args.title;
  span.style.textAlign = 'center';

  let logtxt = document.createElement('div');
  logtxt.classList.add('popup-div');
  logtxt.textContent = args.logText;

  let close_btn = document.createElement('button');
  close_btn.classList.add('popup-btn');
  close_btn.textContent = "Close";
  close_btn.onclick = event => {
    popup.parentElement.removeChild(popup);
  }

  popup.append(span);
  popup.append(vspace(8));
  popup.append(logtxt);
  popup.append(vspace(8));
  popup.append(close_btn);
}

function autocomplete(popup, args) {
  popup.style.display = 'flex';
  popup.style.flexFlow = 'column';

  for (var i=0;i<args.suggestion.length;i++) {
    let span = document.createElement('span');
    span.textContent = args.suggestion[i];
    span.style.textAlign = 'left';
    popup.append(span);
  }
}

function firePopup(xy, opts, args) {
  const div = document.createElement('div');
  div.classList.add('popup');
  div.style.width = opts.width;
  div.style.height = opts.height;
  if ('font' in opts) {
    div.style.font = opts.font;
  }

  div.style.left = xy[0] + 'px';
  div.style.top = xy[1] + 'px';

  if (args.type == 'inputText') {
    inputText(div, args);
  }
  else if (args.type == 'log') {
    log(div, args);
  }
  else if (args.type == 'autocomplete') {
    autocomplete(div, args);
  }

  return div;
}

exports.firePopup = firePopup;
