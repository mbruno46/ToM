const { Menu, MenuItem } = require('electron').remote;
const { setMain } = require('./compiler.js');
const fs = require('fs');

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
  menu.append(new MenuItem({label: 'Rename'}));
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
          let p = target.parentElement;
          p.removeChild(target);
          p.parentElement.removeChild(p);
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
