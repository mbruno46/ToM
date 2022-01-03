<template>
  <div class="page-div" :style="`width: ${width}px;`">
    <canvas ref="canvas" class="page-canvas"/>
  </div>
</template>

<script>
import { ref } from 'vue';
import store from '@/hooks/store.js';

export default {
  props: {
    width: Number,
  },
  setup() {
    const canvas = ref(null);

    function load(page) {
      var scale = 5.0;
      var viewport = page.getViewport({scale: scale});

      // Prepare canvas using PDF page dimensions
      var context = canvas.value.getContext('2d');
      canvas.value.width = viewport.width;
      canvas.value.height = viewport.height;
      store.viewer.aspect_ratio = viewport.width / viewport.height;
      
      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext);      
    }

    return {
      canvas,
      load
    }
  },
}
</script>

<style scoped>
.page-div {
  text-align: center;
  padding-top: 8px;
  padding-bottom: 8px;
}

.page-canvas{
  width: 96%;
  padding-left: 2%;
  padding-right: 2%;
}
</style>