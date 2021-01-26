const { Menu, MenuItem } = require('electron').remote;
const { setMain } = require('./compiler.js');
const fs = require('fs');
const b =  require('./browser.js'); // for some reason this works
const {firePopup} = require('./popup.js');

function FileMenu(target, ext) {
  const menu = new Menu();
  if (ext == "tex") {
    menu.append(new MenuItem({label: 'Set Main',
      click: () => {
        setMain(target.getAttribute("path"));
        const current = document.getElementsByClassName("main");
        if (current && current[0]) {
          current[0].classList.toggle("main");
        }
        target.classList.add("main");
      }
    }));
    menu.append(new MenuItem({type: 'separator'}));
  }

  menu.append(new MenuItem({label: 'Rename',
    click: () => {
      var w = window.innerWidth;
      var h = window.innerHeight;
      xy = [(w-256-120 > 0) ? 120 : 0, 120];
      opts = {width: 'max-content', height: 48};

      let project = document.getElementById('filetree').getAttribute("project-path");
      let base = project.substring(0,project.lastIndexOf('/'));
      project = project.substring(project.lastIndexOf('/'));
      let default_path = target.getAttribute("path");
      default_path = default_path.substring(default_path.lastIndexOf(project));

      args = {type: 'inputText', defaultText: default_path, oktext: 'Rename',
        rows: "1", cols: "40"};
      let p = firePopup(xy, opts, args);
      document.body.append(p);

      let inputText = document.getElementById('popup-inputText');
      let ok_btn = document.getElementById('popup-ok-btn');
      ok_btn.onclick = event => {
        let newpath = base + inputText.value;
        fs.rename(target.getAttribute("path"), newpath,
          function(err) {
            if ( err ) console.log('ERROR: ' + err);
          });
        p.parentElement.removeChild(p);
        target.setAttribute('path',newpath);
        target.textContent = newpath.substring(newpath.lastIndexOf('/')+1);
      }
    }
  }));

  menu.append(new MenuItem({label: 'Delete',
    click: () => {
      let r = dialog.showMessageBox(null, {
        buttons: ["Yes", "No"],
        defaultId: 0,
        title: "Delete file",
        message: `Do you want to delete the file ${target.textContent}?`
      });
      r.then((choice) => {
        if (choice.response==0) {
          fs.unlinkSync(target.getAttribute("path"));
          b.fireBrowser();
        }
      });
    }}));

  return menu;
}

function EditMenu() {
  var menu = Menu.buildFromTemplate([
    {role: 'undo'},
    {role: 'redo'},
    {type: 'separator'},
    {role: 'cut'},
    {role: 'copy'},
    {role: 'paste'},
    {role: 'selectAll'},
  ]);
  return menu;
};

module.exports.FileMenu = FileMenu;
exports.EditMenu = EditMenu;
