const { Menu, MenuItem } = require('electron').remote;
const { setMain } = require('./compiler.js');
const { unsetBrowserMain } = require('./browser.js');

function FileMenu(target, ext) {
  const menu = new Menu();
  if (ext == "tex") {
    menu.append(new MenuItem({label: 'Set Main',
      click: () => {
        setMain(target.getAttribute("path"));
        //unsetBrowserMain();
        target.classList.add("main");
      }
    }));
    menu.append(new MenuItem({type: 'separator'}));
  }
  menu.append(new MenuItem({label: 'Rename'}));

  return menu;
}

module.exports.FileMenu = FileMenu;
