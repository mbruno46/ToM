<template>
  <div :class="'loader ' + (show ? '': 'hidden')" />
</template>

<script>
import store from '@/hooks/store.js';
import { computed } from 'vue';

export default {
  name: "loading-throbber",
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
  border: 0.4rem solid var(--fg);
  border-radius: 80%;
  border-top: 0.4rem solid rgb(38, 194, 255);
  width: 2rem;
  height: 2rem;
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