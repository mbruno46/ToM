const {FileTree} = require('./filetree.js');
const {loadFile, saveCurrentFile} = require('./editor.js');
const {FileMenu} = require('./menu.js');
const {firePreview} = require('./preview.js');

var padding_step = 0.8;
var exts = ["tex", "bib", "pdf"];

function keepFile(ext) {
  var i;
  for (i=0;i<exts.length;i++) {
    if (ext == exts[i]) {
      return true;
    }
  }
  return false;
}


function createFolder(name, path, padding_) {
  var li = document.createElement("li");
  // li.style.padding = '4px 0 4px ' + padding_ + 'rem';
  var span_pad = document.createElement('span');
  span_pad.style.padding = '0 0 0 ' + padding_ + 'rem';
  li.appendChild(span_pad);

  var span = document.createElement("span");
  span.textContent = name;

  span.setAttribute("class","arrow");
  span.setAttribute("path", path);

  span.addEventListener("click", function() {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("arrow-down");
  });
  li.appendChild(span);
  return li;
}

const opts_dialog = {
  type: 'question',
  buttons: ["Yes", "No"],
  defaultId: 0,
  title: "Discad changes",
  message: "Last unsaved changes will be discarded. Continue?"
}

function createFile(name, path, ext, padding_) {
  var li = document.createElement("li");
  // li.style.padding = '4px 0 4px ' + padding_ + 'rem';
  var span_pad = document.createElement('span');
  span_pad.style.padding = '0 0 0 ' + padding_ + 'rem';
  li.appendChild(span_pad);

  var span = document.createElement("span");
  span.textContent = name;

  span.classList.add("file");
  if (ext=="pdf") {
    span.classList.add("image");
    span.addEventListener("click", (ev) => {
      firePreview(span.getAttribute("path"));
    });
  }
  else {
    span.classList.add("text");
    span.addEventListener("click", (ev) => {
      const fn = document.getElementById('editor-filename');
      if (fn.textContent.match(/ \*$/)) {
        let r = dialog.showMessageBox(null, opts_dialog);
        r.then((choice) => {
          if (choice.response==0) {load();}
        });
      };
      load();

      function load() {
        loadFile(span.getAttribute("path"));
        const current = document.getElementsByClassName("file-selected");
        if (current && current[0]) {
          current[0].classList.toggle("file-selected");
        }
        span.parentElement.classList.toggle("file-selected");

        fn.textContent = span.textContent;
        fn.setAttribute("path",span.getAttribute("path"));
      };
    });
  }

  span.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    const menu = FileMenu(ev.target, ext);
    menu.popup({ window: remote.getCurrentWindow() });
  });

  span.setAttribute("path", path);

  li.appendChild(span);
  return li;
}


function fillBrowser(ft, ul, padding_) {
  var exists = -1;

  if (ul.hasChildNodes) {
    var i;
    for (i=0;i<ul.children.length;i++) {
      let span = ul.children[i].children[1];
      let name = span.textContent;
      let path = span.getAttribute('path');
      if (ft.name==name && ft.path==path) {
        exists = i;
      }
    }
  };

  if (ft.items.length > 0) {
    if (exists < 0) {
      var li = createFolder(ft.name, ft.path, padding_);
      var subul = document.createElement("ul");
      subul.setAttribute("class", "nested");
      li.appendChild(subul);
      ul.appendChild(li);
    }
    else {
      var subul = ul.children[exists].children[2];
    }

    var i;
    for (i=0; i<ft.items.length; i++) {
      fillBrowser(ft.items[i], subul, padding_ + padding_step);
    };
  }
  else {
    var ext = ft.name.substring(ft.name.lastIndexOf('.')+1);
    if (!keepFile(ext)) {
      return;
    }
    if (exists < 0) {
      var li = createFile(ft.name, ft.path, ext, padding_);
      ul.appendChild(li);
    }
  }
};


function clearBrowser(ul) {
  while( ul.firstChild ){
    ul.removeChild( ul.firstChild );
  };
};


function fireBrowser(directory = null) {
  ul = document.getElementById('filetree');
  if (directory == null) {
    if (ul.hasAttribute('project-path')) {
      directory = ul.getAttribute("project-path");
    }
    else {
      return;
    }
  }
  else {
    // new project or forced refresh (browser will appear nested)
    clearBrowser(ul);
  }

  var name = directory.substring(directory.lastIndexOf("/")+1);
  var ft = new FileTree(directory, name);
  ft.build();

  fillBrowser(ft, ul, padding_step);

  ul.setAttribute("project-path",directory);
};


exports.fireBrowser = fireBrowser;
