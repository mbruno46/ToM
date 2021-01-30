const { Menu, MenuItem } = require('electron').remote;
const { setMain } = require('./compiler.js');
const fs = require('fs');
const b =  require('./browser.js'); // for some reason this works
const {firePopup} = require('./popup.js');

let win = require('electron').remote.getCurrentWindow();

function FileMenu(target, ext) {
  const menu = new Menu();
  if (ext == "tex") {
    menu.append(new MenuItem({label: 'Set Main',
      click: () => {
        setMain(target);
      }
    }));
    menu.append(new MenuItem({type: 'separator'}));
  }

  menu.append(new MenuItem({label: 'Rename',
    click: () => {
      let project = document.getElementById('filetree').getAttribute("project-path");
      let base = project.substring(0,project.lastIndexOf('/'));
      project = project.substring(project.lastIndexOf('/'));
      let default_path = target.getAttribute("path");
      default_path = default_path.substring(default_path.lastIndexOf(project));

      args = {type: 'inputText', defaultText: default_path, oktext: 'Rename',
        rows: "1", cols: "40"};
      opts = {width: 'max-content', height: '48 px'};
      let p = firePopup([120, 120], opts, args);
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
    }
  }));

  return menu;
}

function FolderMenu(target) {
  const menu = new Menu();

  menu.append(new MenuItem({label: 'Delete',
    click: () => {
      let r = dialog.showMessageBox(null, {
        buttons: ["Yes", "No"],
        defaultId: 0,
        title: "Delete Folder",
        message: `Do you want to delete the directory ${target.textContent} and its content?`
      });
      r.then((choice) => {
        if (choice.response==0) {
          fs.rmdirSync(target.getAttribute("path"), { recursive: true });
          b.fireBrowser();
        }
      });
    }
  }));

  return menu;
}


function EditMenu() {
  var menu = Menu.buildFromTemplate([
    {
      label: 'undo',
    },
    {label: 'redo'},
    {type: 'separator'},
    {role: 'cut', accelerator: 'CmdOrCtrl+X'},
    {role: 'copy', accelerator: 'CmdOrCtrl+C'},
    {role: 'paste', accelerator: 'CmdOrCtrl+V'},
    {role: 'selectAll', accelerator: 'CmdOrCtrl+A'}
  ]);
  return menu;
};

module.exports.FileMenu = FileMenu;
exports.FolderMenu = FolderMenu;
exports.EditMenu = EditMenu;
