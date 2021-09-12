<template>
  <div ref="div">
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  props: {
    msg: String,
  },
  setup(props) {
    const div = ref(null);

    onMounted(()=>{
      console.log(props.msg);
      div.value.innerHTML = props.msg;
    })

    return {
      div,
    }
  },
}
</script>