<template>
  <toolbar>
    <app-button icon="fa-folder-open" title="Open Folder"/>
  </toolbar>
  <PDFViewer/>
</template>

<script>
import Toolbar from '@/components/Toolbar.vue';
import AppButton from '@/components/AppButton.vue';
import PDFViewer from '@/components/PDFViewer.vue';

export default {
  components: {
    Toolbar,
    AppButton,
    PDFViewer,
  },
  setup() {
    
  },
}
</script>