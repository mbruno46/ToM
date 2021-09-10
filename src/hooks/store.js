import { reactive } from 'vue';

const editor = reactive({read: true, path: '', name: '', changed: false});
const browser = reactive({visible: true});
const viewer = reactive({basepath: '', aspect_ratio: 1, refresh: false});
const progressbar = reactive({active: true, value: 0, max: 1});

export default {
  editor,
  browser,
  viewer,
  progressbar,
}