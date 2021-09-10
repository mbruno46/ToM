<template>
  <div :class="'loader ' + (show ? '': 'hidden')" />
</template>

<script>
import store from '@/hooks/store.js';
import { computed } from 'vue';

export default {
  setup() {
    const show = computed(() => {return store.loader.value;})
    return {
      show
    }
  },
}
</script>

<style scoped>
.loader {
  border: 0.2rem solid #f3f3f3;
  border-radius: 50%;
  border-top: 0.2rem solid #3498db;
  width: 1rem;
  height: 1rem;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hidden {
  display: none;
}
</style>