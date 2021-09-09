<template>
    <button class="btn" :title="title" :style="style">
        <i class="fa fa-lg" :class="icon"></i>
    </button>
</template>

<script>
import '@fortawesome/fontawesome-free/js/all.min.js'

export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: String,
    style: {
      type: String,
      default: ''
    },
  }
}
</script>

<style scoped>
.btn {
  background-color: inherit;
  color: var(--text);
  border: none;
  /* border-bottom: 1px solid var(--text); */
  text-decoration:none;
  outline: none;
  display: inline-block;
  align-items: center;
  margin: 0rem;
  box-sizing: border-box;
  width: var(--toolbar-height);
  height: var(--toolbar-height);
  font-size: inherit;
}

.btn {
  transition-duration: 0.5s;
}

.btn:hover {
  color: var(--selected);
}
.btn:active {
  color: var(--selected);
}

/* .active {
  background-color: var(--focus);
} */
</style>