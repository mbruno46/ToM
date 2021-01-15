var pdfjsLib = require('pdfjs-dist');
pdfjsLib.GlobalWorkerOptions.workerSrc = "../node_modules/pdfjs-dist/build/pdf.worker.js";

var pdf = null;
var url = null;

function createPage(num) {
  var viewer = document.getElementById('viewer-pdf');

  var page = document.createElement('div');
  page.setAttribute('class','page-div');
  page.setAttribute('style','width: 100%;');

  var canvas = document.createElement('canvas');
  canvas.setAttribute('id',num);
  canvas.setAttribute('class','page-canvas');

  page.appendChild(canvas);
  viewer.appendChild(page);

  return canvas;
}


function loadPage(num) {
  var canvas = document.getElementById(num);
  if (canvas == null) {
    canvas = createPage(num);
  }

  // Fetch the page
  pdf.getPage(num).then(function(page) {
    var scale = 5.0;
    var viewport = page.getViewport({scale: scale});

    // Prepare canvas using PDF page dimensions
    var context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);
    // renderTask.promise.then(function () {
    //   console.log('Page rendered');
    // });
  });
};


function setViewerPDF(url_) {
  url = url_;
};


function refreshViewer() {
  pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
    pdf = pdfDoc_;
    var i;
    for (i=1; i< pdf.numPages; i++) {
      loadPage(i);
    };
  }, function (reason) {
    // PDF loading error
    alert(reason);
  });
};

function zoom(sign) {
  var pages = document.getElementsByClassName("page-div");

  var w = parseInt(pages[0].style.width,10);
  w += sign * 10;
  if (w<100) {
    p = (100-w)/2;
  }
  else {
    p = 0;
  }

  var i;
  for (i=0; i<pages.length; i++) {
    pages[i].style.width = w +'%';
    pages[i].style.paddingLeft = p + '%';
    pages[i].style.paddingRight = p + '%';
  }
}

exports.setViewerPDF = setViewerPDF
exports.refreshViewer = refreshViewer
exports.zoom = zoom
