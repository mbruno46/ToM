<template>
  <div v-html="msg">
  </div>
</template>

<script>

export default {
  props: {
    msg: String,
  },
}
</script>