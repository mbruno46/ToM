<template>
  <div class="line">
    <br>
  </div>
</template>

<script>

export default {
  setup() {
    
  },
  methods: {
    highlight: function (newHTML) {
      console.log(newHTML)
    }
  }
}
</script>

<style scoped>
.line {
  background-color: grey;
  color: red;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
}
</style>