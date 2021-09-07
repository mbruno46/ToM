import { ref } from 'vue';

const fs = window.require('fs');
const pathlib = window.require('path');

// const data = reactive({});

function UnixHidden(path) {
  if (path.match(/\/\.\w+$/))
    return true;
  return false;
}

// function FileTree(path, exts) {
//   var res = {};

//   fs.readdirSync(path).forEach(file => {
//     var fname = pathlib.resolve(pathlib.join(path, file));
//     var _c = null;

//     if (!UnixHidden(fname)) {
//       if (fs.statSync(fname).isDirectory()) {
//         _c = FileTree(fname, exts);
//       } else {
//         var ext = file.substring(file.lastIndexOf('.')+1);
//         if (exts.includes(ext)) {
//           _c = {};
//         }
//       }
//     }

//     if (_c) {
//       res[file] = {
//         'path': fname,
//         'content': _c,
//       };
//     }
//   });
//   return res;
// }

// function refreshFileTree(path, exts) {
//   data.value = FileTree(path, exts);
// }

// function deselectAll() {
//   for (var value in data.value) {

//   }
// }

// export default {
//   data,
//   refreshFileTree,
// }

export function FileTree(exts) {
  const data = ref([]);

  function readDir(path, depth=0) {
    var res = {}

    fs.readdirSync(path).forEach(file => {
      var fname = pathlib.resolve(pathlib.join(path, file));
      var _c = null;

      if (!UnixHidden(fname)) {
        if (fs.statSync(fname).isDirectory()) {
          _c = readDir(fname, depth + 1);
        } else {
          var ext = file.substring(file.lastIndexOf('.')+1);
          if (exts.includes(ext)) {
            _c = {};
          }
        }
      }
  
      if ((_c!=null) && !(file in res)) {
        res[file] = {
          'path': fname,
          'content': _c,
          'depth': depth,
        };
      }
    });

    return res;
  }

  return {
    get() {
      return data;
    },
    refresh(path) {
      data.value = readDir(path);
    },
    getSelected() {
      return document.getElementByID("treecell").getAttribute("treecell-selected");
    }
  }
}

export default {
  FileTree,
}