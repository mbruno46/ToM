<template>
  <toolbar>
    <div class="vert" style="padding: 0 1rem;">
      <input class="finder" placeholder="find"/>
      <button class="finder-btn">FIND</button>
    </div>
    <div class="vert" style="position: absolute; right: 0;">
      <loader />
      <app-button icon="fa-cog" title="Settings" style="float: right"/>
    </div>
  </toolbar>
</template>

<script>
import Toolbar from '@/components/Toolbar.vue';
import AppButton from '../components/AppButton.vue';
import Loader from '../components/Loader.vue';

export default {
  components: {
    Toolbar,
    AppButton,
    Loader,
  },
  setup() {
  },
}
</script>

<style scoped>
.finder {
  font-family: 'Source Code Pro', monospace;
  font-size: 1rem;
  color: var(--fg);
  background-color: var(--bg1);
  width: 100%;
  outline: none;
  border: 2px solid var(--line);
  resize: none;
  vertical-align: middle;
  white-space: nowrap;
  overflow-y: hidden;
  overflow-x: auto;
}

.finder-btn {
  margin-left: 0.5rem;
}

.vert {
  align-items: center;
  display: flex;
  height: 100%;
}
</style>