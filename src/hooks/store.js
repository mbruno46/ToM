import { reactive, ref } from 'vue';

const editor = reactive({read: true, path: '', name: '', changed: false, clean: false});
const browser = reactive({visible: true});
const viewer = reactive({basepath: '', aspect_ratio: 1, refresh: false});
const loader = ref(false);

export default {
  editor,
  browser,
  viewer,
  loader,
}