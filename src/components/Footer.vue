<template>
  <div class="footer" @click="this.test = 'clicked'">
    {{test}}
  </div>
</template>

<script>
import { ref } from '@vue/reactivity'
export default {
  setup() {
    const test = ref('prova');
    return {
      test
    }
  },
}
</script>
<style scoped>
.footer {
  width: 100%;
  height: 3rem;
}
</style>