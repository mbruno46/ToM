const { Menu, MenuItem } = require('electron').remote;
// const {FileTree} = require('./components/filetree.js');
const {FileTree} = require('./filetree.js');
const {loadFile} = require('./editor.js');

var project = null;

function fillBrowser(ft, ul) {
  var li = document.createElement("li");
  var span = document.createElement("span");
  span.textContent = ft.name;

  if (ft.items.length > 0) {
    span.setAttribute("class","arrow");
    span.addEventListener("click", function() {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("arrow-down");
    });    
    li.appendChild(span)

    var subul = document.createElement("ul");
    subul.setAttribute("class", "nested");

    var i;
    for (i=0; i<ft.items.length; i++) {
      fillBrowser(ft.items[i], subul);
    };

    li.appendChild(subul);
  }
  else {
    span.setAttribute("class", "file");
    span.setAttribute("path", ft.path);

    span.addEventListener("click", function(ev) {
      // ev.preventDefault();
      var ext = ft.path.substring(ft.path.lastIndexOf('.')+1);
      if (ext != "tex" && ext != "bib") {
        return;
      }

      loadFile(ft.path);

      var filename = document.getElementById('file-name');
      filename.innerHTML = ft.name;

      // console.log(ev.target.getAttribute('path'))
    });

    span.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();

      const menu = new Menu();
      var ext = ft.path.substring(ft.path.lastIndexOf('.')+1);
      if (ext == "tex") {
        menu.append(new MenuItem({label: 'Set Main',
          click: function() {
            alert(ft.path);
          }
        }));
        menu.append(new MenuItem({type: 'separator'}));
      }
      menu.append(new MenuItem({label: 'Rename'}));

      menu.popup({ window: remote.getCurrentWindow() });
    });

    li.appendChild(span);
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

  project = directory;
};

exports.fireBrowser = fireBrowser;
exports.project = project;
