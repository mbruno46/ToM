import { reactive } from 'vue';

const editor = reactive({read: true, path: '', name: '', changed: false});
const browser = reactive({visible: true});

export default {
  editor,
  browser
}