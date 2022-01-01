<template>
  <div class="toolbar">
    <slot/>
  </div>
</template>

<script>
export default {
  name: "tool-bar",
}
</script>

<style scoped>
.toolbar {
  width: 100%;
  height: var(--toolbar-height);
  background-color: var(--bg);
  position: relative;
  display: flex;
  flex-flow: row;
}
</style>