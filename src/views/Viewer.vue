<template>
  <toolbar>
    <app-button icon="fa-sync-alt" title="Refresh" @click="load"/>
    <app-button icon="fa-search-plus" title="Zoom in" @click="zoomIn"/>
    <app-button icon="fa-search-minus" title="Zoom out" @click="zoomOut"/>
    <app-button icon="fa-arrows-alt-v" title="Fit vertical" @click="fitV"/>
    <app-button icon="fa-arrows-alt-h" title="Fit horizontal" @click="fitH"/>
  </toolbar>
  <!-- <PDFViewer/> -->
  <div ref="viewer" class="pdf-viewer">
    <PDFPage v-for="index in numpages" 
      :key="index" 
      :num="index" 
      :pdfproxy="pdf"
      :width="width"/>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar.vue';
import AppButton from '@/components/AppButton.vue';
import PDFPage from '@/components/PDFPage.vue';
import { ref } from '@vue/reactivity';
import { onMounted } from '@vue/runtime-core';
import store from '@/hooks/store.js';

const pdfjsLib = window.require('pdfjs-dist');
import PDFJSWorker from 'pdfjs-dist/build/pdf.worker.entry'
const fs = window.require('fs');

export default {
  components: {
    Toolbar,
    AppButton,
    PDFPage,
  },
  setup() {
    const numpages = ref(null);
    const pdf = ref(null);
    const width = ref(0);
    const viewer = ref(null);

    var path = '/Users/mbruno/Physics/talks/valencia_19/valencia_19.pdf';

    function load() {
      var data = fs.readFileSync(path, null);
      pdfjsLib.getDocument(data).promise.then((pdfDoc_) => {
        pdf.value = pdfDoc_;
        numpages.value = pdfDoc_.numPages;
      }, function (reason) {
        // PDF loading error
        alert('Error ' + reason);
      });
    }

    function zoomIn() {
      width.value *= 1.10;
    }
    function zoomOut() {
      width.value /= 1.10;
    }
    function fitV() {
      width.value = store.viewer.aspect_ratio * viewer.value.offsetHeight;
    }
    function fitH() {
      width.value = viewer.value.offsetWidth;
    }

    onMounted(() => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker
      load();
      fitH();
    })
    
    return {
      load,
      numpages,
      pdf,
      width,
      viewer,
      zoomIn,
      zoomOut,
      fitV,
      fitH,
    }
  },
}
</script>

<style scoped>
.pdf-viewer {
  width: 100%;
  height: calc(100% - var(--toolbar-height));
  display: flex;
  flex-flow: column;
  overflow-x: scroll;
  overflow-y: scroll;
}
</style>