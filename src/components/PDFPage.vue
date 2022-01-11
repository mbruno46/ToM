<template>
  <div class="page-div" :style="`width: ${width}px;`">
    <canvas ref="canvas" class="page-canvas" @dblclick="sync_pdf_tex"/>
  </div>
</template>

<script>
import { ref } from 'vue';
import store from '@/hooks/store.js';

var scale = 5.0;

export default {
  props: {
    width: Number,
  },
  emits: ['sync_pdf_tex'],
  setup() {
    const canvas = ref(null);

    function load(page) {
      var viewport = page.getViewport({scale: scale});
      console.log(viewport.width/ scale, viewport.height/scale, )
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
  methods: {
    sync_pdf_tex(event) {
      var rect = this.$refs.canvas.getBoundingClientRect();
      var r = rect.width / this.$refs.canvas.width * scale;
      var x = (event.clientX - rect.left) / r;
      var y = (event.clientY - rect.top) / r;
      this.$emit('sync_pdf_tex', {x: x, y: y});
    }
  }
}
</script>

<style scoped>
.page-div {
  text-align: center;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 4%;
  padding-right: 4%;
}

.page-canvas{
  width: 100%;
}
</style>