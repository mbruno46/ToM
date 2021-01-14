const fs = require('electron').remote.require('fs');
const pathlib = require('path');

class FileTree {
  constructor(path, name = null){
    this.path = path;
    this.name = name;
    this.items = [];
  };

  build = () => {
    this.items = FileTree.readDir(this.path);
  };

  static readDir(path) {
    var filelist = [];

    fs.readdirSync(path).forEach(file => {
      var tempfile = new FileTree(pathlib.join(path, file), file);

      var stat = fs.statSync(tempfile.path);

      if (stat.isDirectory()){
          tempfile.items = FileTree.readDir(tempfile.path);
      };

      filelist.push(tempfile);
    });

    return filelist;
  };
};


function fillBrowser(ft, ul) {
  var li = document.createElement("li");
  var span = document.createElement("span");
  span.textContent = ft.name;

  if (ft.items.length > 0) {
    span.setAttribute("class", "arrow");
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
    span.setAttribute("class", "file")
    span.addEventListener("click", function(ev) {
      // ev.preventDefault();
      var ext = ft.path.substring(ft.path.lastIndexOf('.')+1);
      if (ext != "tex" && ext != "bib") {
        return;
      }

      fs.readFile(ft.path, 'utf-8', (err, data) => {
          if(err){
              alert("An error ocurred reading the file :" + err.message);
              return;
          }

          codemirror.setValue(data);
      });
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
};
