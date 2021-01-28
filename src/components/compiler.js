const { exec } = require('child_process');
// const {fireBrowser} = require('./browser.js');
const b =  require('./browser.js'); // for some reason this works and above does not
const { setViewerPDF, refreshViewer } = require('./viewer.js');

const fixPath = require('fix-path');
fixPath();

var maintex = null;

function setMain(target) {
  maintex = target.getAttribute("path");
  const current = document.getElementsByClassName("main");
  if (current && current[0]) {
    current[0].classList.toggle("main");
  }
  target.classList.add("main");

  let base = maintex.substring(0,maintex.lastIndexOf('.'));
  setViewerPDF(base + '.pdf');
  compile();
}

function compile(fire_browser = false) {
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
