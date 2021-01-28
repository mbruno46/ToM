const {FileTree} = require('./filetree.js');
const {loadFile, saveCurrentFile, hasDocumentClass} = require('./editor.js');
const {FileMenu, FolderMenu} = require('./menu.js');
const {firePreview} = require('./preview.js');
const {setMain} = require('./compiler.js');

var padding_step = 0.8;
// extensions of files handled by the program
var exts = ["tex", "bib", "pdf"];
var has_document_class = null;

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
  span.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    const menu = FolderMenu(ev.target);
    menu.popup({ window: remote.getCurrentWindow() });
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

function createFile(name, path, padding_) {
  var li = document.createElement("li");
  // li.style.padding = '4px 0 4px ' + padding_ + 'rem';
  var span_pad = document.createElement('span');
  span_pad.style.padding = '0 0 0 ' + padding_ + 'rem';
  li.appendChild(span_pad);

  var span = document.createElement("span");
  span.textContent = name;

  span.classList.add("file");
  var ext = name.substring(name.lastIndexOf('.')+1);

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
      } else {
        load();
      }

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

  if (hasDocumentClass(path)) {
    if (has_document_class==null) {
      has_document_class = span;
    }
    else {
      has_document_class = 'cannot resolve';
    }
  }

  li.appendChild(span);
  return li;
}


function appendAtIndex(parent, child, index) {
  if (!index) index = 0
  if (index >= parent.children.length) {
    parent.appendChild(child)
  } else {
    parent.insertBefore(child, parent.children[index])
  }
}


function fillBrowser(ft, ul, idx, padding_) {
  var _idx = -1;

  if (ul.hasChildNodes) {
    var i;
    for (i=0;i<ul.children.length;i++) {
      let span = ul.children[i].children[1];
      let name = span.textContent;
      let path = span.getAttribute('path');
      if (ft.name==name && ft.path==path) {
        _idx = i;
      }
    }
  };

  // some entries have been deleted before current one
  if (_idx > idx) {
    var i;
    for (i=idx; i<_idx; i++) {
      ul.removeChild(ul.children[i]);
    }
  }

  if (ft.isdir) {
    if (_idx < 0) {
      var li = createFolder(ft.name, ft.path, padding_);
      var subul = document.createElement("ul");
      subul.setAttribute("class", "nested");
      li.appendChild(subul);
      // ul.appendChild(li);
      appendAtIndex(ul, li, idx);
    }
    else {
      // simple refresh
      var subul = ul.children[idx].children[2];
    }

    var i;
    for (i=0; i<ft.items.length; i++) {
      fillBrowser(ft.items[i], subul, i, padding_ + padding_step);
    };
    for (i=ft.items.length;i<subul.children.length;i++) {
      subul.removeChild(subul.children[i]);
    }
  }
  else {
    if (_idx < 0) {
      var li = createFile(ft.name, ft.path, padding_);
      // ul.appendChild(li);
      appendAtIndex(ul, li, idx);
    }
  }
};


function clearBrowser(ul) {
  while( ul.firstChild ){
    ul.removeChild( ul.firstChild );
  };
};


function fireBrowser(directory = null, auto_setmain = false) {
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
  var ft = new FileTree(directory, exts, name);
  ft.build();

  fillBrowser(ft, ul, 0, padding_step, auto_setmain);

  ul.setAttribute("project-path",directory);

  if (has_document_class != null && has_document_class != 'cannot resolve') {
    if (auto_setmain)
      setMain(has_document_class);
  }
};

exports.fireBrowser = fireBrowser;
