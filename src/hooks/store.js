import { reactive, ref } from 'vue';

const editor = reactive({read: true, path: '', name: '', changed: false, clean: false});
const browser = reactive({visible: true, moving: false, file: ''});
const viewer = reactive({basepath: '', aspect_ratio: 1, refresh: false});
const loader = ref(false);
const preferences = reactive({show: false, autosave: 0, fontsize: 12});

export default {
  editor,
  browser,
  viewer,
  loader,
  preferences,
}