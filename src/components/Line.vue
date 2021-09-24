<template>
  <div ref="line" class="line">
    <br>
  </div>
</template>

<script>
import highlight from '@/hooks/highlight.js';
import { onMounted, ref, watch } from 'vue';



export default {
  props: {
    text: {
      type: String,
      default: ''
    },
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const line = ref(null);

    onMounted(()=>{
      watch(()=>{
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