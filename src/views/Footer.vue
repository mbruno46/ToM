<template>
  <toolbar>
    <div>
      <input placeholder="find"/>
    </div>
    <div class="pbar">
      <progress-bar />
    </div>
  </toolbar>
</template>

<script>
import Toolbar from '@/components/Toolbar.vue';
import ProgressBar from '@/components/ProgressBar.vue';

export default {
  components: {
    Toolbar,
    ProgressBar,
  },
  setup() {
    
  },
}
</script>

<style scoped>
.pbar {
  float: right;
  align-items: center;
  display: flex;
  height: 100%;
}
</style>