<template>
  <div v-show="(visible)" class="minicell" :style="`left: ${x}px; top: ${y}px`">
    {{name}}
  </div>
</template>


<script>
import store from '@/hooks/store.js'
import { computed } from '@vue/reactivity'


export default {
  props: {
    x: Number,
    y: Number,
  },
  setup() {
    const name = computed(()=>{
      return store.browser.selected.name;
    });

    const visible = computed(()=>{return store.browser.moving==2});

    return {
      name,
      visible
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