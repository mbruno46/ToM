const { exec, execSync } = require('child_process');
// const {fireBrowser} = require('./browser.js');
const b =  require('./browser.js'); // for some reason this works and above does not
const { setViewerPDF, refreshViewer } = require('./viewer.js');
const {firePopup} = require('./popup.js');
const fs = require('electron').remote.require('fs');

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
  cmd = 'cd ' + workdir +'; latexmk -pdf -silent -g ' + maintex;

  var run = exec(cmd, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (err != null) {
      // let data = fs.readFileSync(maintex.substring(0,maintex.lastIndexOf('.')) + '.log', 'utf-8');
      let data = execSync('grep "\! " -A 2 -B 1 ' + maintex.substring(0,maintex.lastIndexOf('.')) + '.log');
      args = {type: 'log',  logText: data, title: 'LaTeX Compilation Error'};
      opts = {width: '80vw', height: 'minmax(max-content,200px)'};
      let p = firePopup([120, 120], opts, args);
      document.body.append(p);
      // alert(`exec error: ${err}`);
    } else {
      refreshViewer();
      // refresh browser in case pdf file was created for first time
      b.fireBrowser();
    }
  });

};


exports.compile = compile;
exports.setMain = setMain;
