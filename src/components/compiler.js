const { exec } = require('child_process');
// const {fireBrowser} = require('./browser.js');
const b =  require('./browser.js'); // for some reason this works and above does not
const { setViewerPDF, refreshViewer } = require('./viewer.js');

var maintex = null;

function setMain(file) {
  maintex = file;
  let base = file.substring(0,file.lastIndexOf('.'));
  setViewerPDF(base + '.pdf');
}

function compile() {
  if (maintex == null) {
    alert('Main Tex file not set. Please use Set Main by clicking on the desired file');
    return;
  }

  // var project = document.getElementById('filetree').getAttribute("project-path");
  var workdir = maintex.substring(0,maintex.lastIndexOf('/'));
  cmd = 'cd ' + workdir +'; latexmk -pdf -f -g ' + maintex;

  var run = exec(cmd, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (err != null) {
      alert(`exec error: ${err}`);
    }
    refreshViewer();
    // refresh browser in case pdf file was created for first time
    b.fireBrowser();
  });

};


exports.compile = compile;
exports.setMain = setMain;
