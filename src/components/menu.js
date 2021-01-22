const { Menu, MenuItem } = require('electron').remote;
const { setMain } = require('./compiler.js');
const { unsetBrowserMain } = require('./browser.js');

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
