<template>
  <div class="toolbar">
    <slot/>
  </div>
</template>

<style scoped>
.toolbar {
  width: 100%;
  height: var(--toolbar-height);
  background-color: var(--bg);
}

</style>