<template>
  <tool-bar>
    <div class='grid'>
      <div>
        <app-button icon="fa-sync-alt" title="Refresh" @click="$emit('sync')"/>  
      </div>
      <div style="text-align: center;">
        <app-button icon="fa-search-plus" title="Zoom in" @click="zoomIn"/>
        <app-button icon="fa-search-minus" title="Zoom out" @click="zoomOut"/>
        <app-button icon="fa-arrows-alt-v" title="Fit vertical" @click="fitV"/>
        <app-button icon="fa-arrows-alt-h" title="Fit horizontal" @click="fitH"/>
      </div>
      <div>
        <app-button icon="fas fa-question" title="Help"
          @click="open_menu_help"/>  
      </div>      
    </div>
  </tool-bar>
  <div ref="viewer" class="pdf-viewer" :style="error ? 'display:none' : ''">
    <PDFPage v-for="index in numpages" 
      :key="index" 
      :num="index" 
      :width="width"
      :ref="setPages"
      @sync_pdf_tex="sync_pdf_tex(index, $event)"/>
  </div>
  <div class="pdf-viewer" :style="error ? '' : 'display:none'">
    <error-message v-for="(txt, index) in errmsg" :key="index" :msg="txt"/>
  </div>
</template>

<script>
import ToolBar from '@/components/ToolBar.vue';
import AppButton from '@/components/AppButton.vue';
import PDFPage from '@/components/PDFPage.vue';
import { ref, onMounted, onBeforeUpdate, watchEffect } from 'vue';
import store from '@/hooks/store.js';
import utils from '@/hooks/utils.js';
import {HighlightError} from '@/hooks/highlight.js';
import ErrorMessage from '../components/ErrorMessage.vue';
import {syncTex} from '@/hooks/synctex.js';

const pdfjsLib = window.require('pdfjs-dist');
import PDFJSWorker from 'pdfjs-dist/build/pdf.worker.entry'
const fs = window.require('fs');

const {ipcRenderer} = window.require('electron');

var sync;
var h = HighlightError();

export default {
  components: {
    ToolBar,
    AppButton,
    PDFPage,
    ErrorMessage,
  },
  emits: ['sync','focus_line'],
  setup() {
    const numpages = ref(null);
    const width = ref(0);
    const viewer = ref(null);
    const error = ref(false);
    const errmsg = ref([]);

    let pages = []
    const setPages = el => {
      if (el) {
        pages.push(el)
      }
    }
    onBeforeUpdate(() => {
      pages = [];
    });

    var path;
    function load() {
      if (!fs.existsSync(path)) {
        db();
        return;
      }
      var data = fs.readFileSync(path, null);
      pdfjsLib.getDocument(data).promise.then((pdfDoc) => {
        numpages.value = pdfDoc.numPages;

        for (let i = 0; i < numpages.value; i++) {
          pdfDoc.getPage(i+1).then(function(page) {
            pages[i].load(page);
          });
        }
        db();
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

    let db = utils.debouncer(function() {      
      store.loader.value = false;
    }, 500);

    function compile(callback = ()=>{}) {
      utils.compileTex(store.viewer.basepath, 
      ()=>{
        error.value = false;
        load();
        load_synctex();
        callback();
      },
      (msg)=>{
        error.value = true;
        errmsg.value = [];
        for (var i=0; i<msg.length; i++) {
          errmsg.value.push(h(msg[i]));
        }
        db();
      });
    }

    function load_synctex() {
      let fname = store.viewer.basepath + '.synctex';
      if (fs.existsSync(fname)) {
        sync = syncTex(fname);
      } else {
        sync = null;
      }
    }

    onMounted(() => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker

      watchEffect(() => {
        path = store.viewer.basepath + '.pdf';
        load();
        fitH();
        load_synctex();
      });

    });
  
    return {
      load,
      setPages,
      numpages,
      width,
      viewer,
      zoomIn,
      zoomOut,
      fitV,
      fitH,
      error,
      errmsg,
      compile,
    }
  },
  methods: {
    open_menu_help() {
      ipcRenderer.send('fire_helpmenu');
    },
    sync_pdf_tex(i ,e) {
      if (sync==null) {return;}

      let s = sync.pdf2tex(i, e.x, e.y);
      // check if file open in editor is already target; if not open it
      if (store.editor.path != s.file) {
        store.browser.selected.path = s.file;
        store.browser.selected.name = utils.getName(s.file);
      }
      // emit focusLine
      this.$emit('focus_line', s.line);
    }
  },
  mounted() {
    ipcRenderer.on('viewer-command', (event, key) => {
      console.log(event);
      this[key]();
    });
  }
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

.grid {
  display: grid;
  width: 100%;
  grid-template-columns: max-content 1fr max-content;
}
</style>