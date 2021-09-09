import { reactive } from 'vue';

const editor = reactive({read: true, path: '', name: '', changed: false});

export default {
  editor
}