const { exec } = require('child_process');
const { project } = require('./browser.js');

var maintex = null;

function setMain(file) {
  maintex = file;
}

function compile() {
  cmd = 'cd ' + project +'; latexmk -pdf valencia_19.tex';
  var run = exec(cmd, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (err != null) {
      alert(`exec error: ${error}`);
    }
  });

  refreshViewer();
};

exports.compile = compile;
