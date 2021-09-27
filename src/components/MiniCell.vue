<template>
  <div v-show="(visible && visible2)" class="minicell" :style="`left: ${x}px; top: ${y}px`">
    {{name}}
  </div>
</template>


<script>
import store from '@/hooks/store.js'
import { computed } from '@vue/reactivity'


export default {
  props: {
    visible: Boolean,
    x: Number,
    y: Number,
  },
  setup() {
    const name = computed(()=>{
      let n = store.browser.file;
      return n.substring(n.lastIndexOf('/')+1);
    });

    const visible2 = computed(()=>{return store.browser.moving});

    return {
      name,
      visible2
    }
  },
}
</script>


<style scoped>
.minicell {
  /* display: block; */
  position: absolute;
  z-index: 2;
  width: fit-content;
  font-size: 0.8rem;
  padding: 0.2rem;
  background-color: var(--dark-blue);
  color: var(--selected);
  pointer-events: none;
}
</style>