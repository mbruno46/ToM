<template>
  <progress :class="'bar ' + (pbar.active ? '' : 'hidden')" :value="pbar.value" :max="pbar.max"></progress>
</template>

<script>
import store from '@/hooks/store.js';
import { computed } from 'vue';

export default {
  setup() {
    const pbar = computed(() => {return store.progressbar});

    return {
      pbar
    }
  },
}
</script>

<style scoped>
.bar {
  margin: 0.5rem;
  height: 1rem;
}

.hidden {
  display: none;
}

</style>