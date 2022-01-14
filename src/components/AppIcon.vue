<template>
  <div class="icn" >
    <i class="fa fa-lg" :class="icon"/>
  </div>
  <span class="text" :style="'color: ' + color + ';'">
    {{short_text}}
  </span>
</template>

<script>
import { computed } from '@vue/reactivity'

export default {
  props: {
    icon: String,
    color: {
      type: String,
      default: 'var(--text)',
    },
    text: {
      type: String,
      default: '',
    }
  },
  setup(props) {
    const short_text = computed(()=>{return props.text.substring(0,6);});

    return {short_text}
  },
}
</script>

<style scoped>
.icn {
  background-color: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0rem;
  width: var(--toolbar-height);
  height: var(--toolbar-height);
  font-size: inherit;
}

.text {
  padding: 0 2% 0 2%;
  white-space: nowrap;
}
</style>