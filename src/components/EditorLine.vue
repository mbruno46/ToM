<template>
  <div ref="line" class="line" :class="(focus) ? 'focus' : ''">
    <br>
  </div>
</template>

<script>
import highlight from '@/hooks/highlight.js';
import { onMounted, ref, watchEffect } from 'vue';

export default {
  name: "editor-line",
  props: {
    text: {
      type: String,
      default: ''
    },
    highlight: {
      type: Boolean,
      default: false,
    },
    focus: Boolean,
  },
  setup(props) {
    const line = ref(null);

    onMounted(()=>{
      watchEffect(()=>{
        var tt = "<br>";
        if (props.text!="") {
          if (props.highlight) tt = highlight.LaTeXHighlighter(props.text);
          else tt = highlight.plainHighlighter(props.text);
        }
        line.value.innerHTML = tt;
      })
    })

    return {
      line
    }
  },
}
</script>

<style scoped>
.line {
  margin: 0 0 0 4.5rem;
  position: relative;
}
</style>