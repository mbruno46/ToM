const {FileTree} = require('./filetree.js');
const {loadFile} = require('./editor.js');
const {FileMenu} = require('./menu.js');
const {firePreview} = require('./preview.js');

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


function createFolder(name, path) {
  var li = document.createElement("li");
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


function createFile(name, path, ext) {
  var li = document.createElement("li");
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
      loadFile(span.getAttribute("path"));
      deselectAllFiles();
      span.parentElement.classList.add("selected");
    });
    span.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      const menu = FileMenu(ev.target, ext);
      menu.popup({ window: remote.getCurrentWindow() });
    })
  }
  span.setAttribute("path", path);

  li.appendChild(span);
  return li;
}


function deselectAllFiles() {
  const text_files = document.getElementsByClassName("text");
  var j;
  for (j=0;j<text_files.length;j++) {
    text_files[j].parentElement.classList.remove("selected");
  }
}


function unsetBrowserMain() {
  const text_files = document.getElementsByClassName("text");
  var j;
  for (j=0;j<text_files.length;j++) {
    text_files[j].classList.remove("main");
  }
}


function fillBrowser(ft, ul) {
  if (ft.items.length > 0) {
    var li = createFolder(ft.name);

    var subul = document.createElement("ul");
    subul.setAttribute("class", "nested");

    var i;
    for (i=0; i<ft.items.length; i++) {
      fillBrowser(ft.items[i], subul);
    };

    li.appendChild(subul);
  }
  else {
    var ext = ft.name.substring(ft.name.lastIndexOf('.')+1);
    if (!keepFile(ext)) {
      return;
    }
    var li = createFile(ft.name, ft.path, ext);
  }

  ul.appendChild(li);
};


function clearBrowser(ul) {
  while( ul.firstChild ){
    ul.removeChild( ul.firstChild );
  };
};


function fireBrowser(directory) {
  ul = document.getElementById('filetree');
  clearBrowser(ul);

  var name = directory.substring(directory.lastIndexOf("/")+1);
  var ft = new FileTree(directory, name);
  ft.build();

  fillBrowser(ft, ul);

  ul.setAttribute("project-path",directory);
};


exports.fireBrowser = fireBrowser
exports.unsetBrowserMain = unsetBrowserMain
