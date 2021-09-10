<template>
  <toolbar>
    <app-button icon="fa-sync-alt" title="Refresh" @click="$emit('sync')"/>
    <app-button icon="fa-search-plus" title="Zoom in" @click="zoomIn"/>
    <app-button icon="fa-search-minus" title="Zoom out" @click="zoomOut"/>
    <app-button icon="fa-arrows-alt-v" title="Fit vertical" @click="fitV"/>
    <app-button icon="fa-arrows-alt-h" title="Fit horizontal" @click="fitH"/>
  </toolbar>
  <div ref="viewer" class="pdf-viewer">
    <PDFPage v-for="index in numpages" 
      :key="index" 
      :num="index" 
      :pdfproxy="pdf"
      :width="width"
      :reload="reload"/>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar.vue';
import AppButton from '@/components/AppButton.vue';
import PDFPage from '@/components/PDFPage.vue';
import { ref, onMounted, watch } from 'vue';
import store from '@/hooks/store.js';
import utils from '@/hooks/utils.js';

const pdfjsLib = window.require('pdfjs-dist');
import PDFJSWorker from 'pdfjs-dist/build/pdf.worker.entry'
const fs = window.require('fs');

export default {
  components: {
    Toolbar,
    AppButton,
    PDFPage,
  },
  emits: ['sync'],
  setup() {
    const numpages = ref(null);
    const pdf = ref(null);
    const width = ref(0);
    const viewer = ref(null);
    const reload = ref(false);

    function load() {
      var path = store.viewer.basepath + '.pdf';
      if (!fs.existsSync(path)) {
        db1();
        return;
      }
      var data = fs.readFileSync(path, null);
      pdfjsLib.getDocument(data).promise.then((pdfDoc_) => {
        pdf.value = pdfDoc_;
        numpages.value = pdfDoc_.numPages;
        reload.value = !reload.value;
        db0();
        db1();
        fitH();
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
    let db0 = utils.debouncer(function() {      
      store.progressbar.value += 1;
    }, 500);
    let db1 = utils.debouncer(function() {      
      store.progressbar.active = false;
      store.loader.value = false;
    }, 1500);

    function compile() {
      utils.compileTex(store.viewer.basepath, load);
    }

    onMounted(() => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker
      load();
    });

    watch(
      () => store.viewer.basepath,
      (newv, oldv) => {
        console.log(newv, oldv)
        // if (path != newv) {
        load();
        // }
      }
    );
  
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
      compile,
      reload,
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