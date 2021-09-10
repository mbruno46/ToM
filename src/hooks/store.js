import { reactive } from 'vue';

const editor = reactive({read: true, path: '', name: '', changed: false});
const browser = reactive({visible: true});
const viewer = reactive({basepath: '', aspect_ratio: 1});

export default {
  editor,
  browser,
  viewer,
}