<template>
  <div ref="cell" class="cell">
    <span :class="'tag icon ' + setIcon(isDir, name) + ' ' + (isMain ? 'main':'') + ' ' + (isSelected ? 'selected' : '')"
      :style="'padding-left: ' + (0.5 + depth) +  'rem'" 
      @mousedown="mouseDown(path, name)"
      @mouseup="mouseUp(path)"
      @contextmenu="fire_contextmenu"
      >
      {{name}}
    </span>
    <div v-if="isDir" class="nested">
      <TreeCell v-for="(value,key) in content" 
        :key="value['path']"
        :path="value['path']"
        :content="value['content']" 
        :name="key"
        :depth="value['depth']"
        :isDir="value['isDir']"
        @flatten_parent="isNested = false; $emit('flatten_parent');"
      />
    </div>
  </div>
</template>

<script>
import '@fortawesome/fontawesome-free/js/all.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { ref, watchEffect } from 'vue'
import utils from '@/hooks/utils.js'
import store from '@/hooks/store.js'

const {ipcRenderer} = window.require('electron');

function get_basepath(p) {
  return p.substring(0, p.lastIndexOf('.tex'))
}

export default {
  name: "TreeCell",
  props: {
    path: String,
    content: Object,
    name: String,
    depth: Number,
    isDir: Boolean,
  },
  emits: ['flatten_parent'],
  setup(props) {
    const isMain = ref(false);
    const isSelected = ref(false);
    const isNested = ref(true);

    if (utils.getExtension(props.name) == 'tex') {
      if (utils.isMainTexFile(props.path)) {
        if (store.viewer.basepath != '') {
          alert('Multiple main tex files detected; set manually the right one!')
        } else {
          store.viewer.basepath = get_basepath(props.path);
          // isMain.value = true;
        }
      }
    }

    return {
      isMain,
      isSelected,
      isNested,
    }
  },
  methods: {
    mouseDown(path, name) {
      store.browser.selected.path = path;
      store.browser.selected.name = name;

      if (this.isDir) {
        this.isNested = !this.isNested;
      } else {
        store.browser.moving = 1;
      }  
    },
    mouseUp(path) {
      if (store.browser.moving == 2) {
        if (this.isDir) utils.mv(store.browser.selected.path, path);
        else {
          let p = path;
          utils.mv(store.browser.selected.path, p.substring(0,p.lastIndexOf('/')));
        }
        store.browser.selected.path = '#moved#';
      }
      store.browser.moving = 0;
    },
    setIcon(isDir, name) {
      if (isDir) {
        return this.isNested ? 'dir' : 'dir-open';
      } else {
        return utils.getExtension(name);
      }
    },
    fire_contextmenu() {    
      store.browser.moving = 0;
      let info = {
        name: this.name,
        orig: this.path,
        isDir: this.isDir,
        main: utils.isMainTexFile(this.path) ? get_basepath(this.path) : '',
        open: utils.getAllowedExts('figure').includes('.'+utils.getExtension(this.name))
      }
      ipcRenderer.send('fire_contextmenu', info);
    },
    handleSelection() {
      let name = store.browser.selected.name;
      let path = store.browser.selected.path;

      if (!this.isDir) {
        this.$emit('flatten_parent');
        let e = utils.getExtension(name);
        if ((e == 'tex') || (e=='bib')) {
          if (store.editor.name != name) {
            store.editor_load(path, name);
          }
        }
      }
    },
  },
  mounted() {
    watchEffect(()=>{
      if (store.browser.selected.path == this.path) {
        this.isSelected = true;
        this.handleSelection();
      } else{
        this.isSelected = false;
      }   
    });
    watchEffect(()=>{
      let el = this.$refs.cell;
      if (this.isDir) {
        if (this.isNested) {
          el.children[1].classList.add('nested');
          el.children[0].classList.add('dir');
          el.children[0].classList.remove('dir-open');
        } else {
          el.children[1].classList.remove('nested');
          el.children[0].classList.remove('dir');
          el.children[0].classList.add('dir-open');
        }
      }
    });
    watchEffect(()=>{
      if (store.viewer.basepath == get_basepath(this.path)) {
        this.isMain = true;
      } else {
        this.isMain = false;
      }
    });
  },
}
</script>

<style scoped>
/* Hide the nested list */
.nested {
  display: none;
}

.cell {
  display: flex;
  flex-flow: column;
  width: max-content;
  min-width: 100%;
  cursor: pointer;
}

.tag {
  width:100%; 
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.icon::before {
  display: inline-block;
  width: 1rem;
  margin-right: 0.5rem;
  text-align: center;
  font-style: normal;
  font-variant: normal;
  font-size: 1.0rem;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
}

.dir::before {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  content: "\f105";
  color: var(--yellow);
}
.dir-open::before {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  content: "\f107";
  color: var(--yellow);
}
.tex::before {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  content: "\f15c";
  color: var(--green);
}
.bib::before {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  content: "\f1c9";
  color: var(--green);
}
.pdf::before {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  content: "\f1c1";
  color: var(--cyan);
}
.main::after {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  content: "\f192";
  margin-left: 0.5rem;
  color: var(--pink);
}

.selected {
  background-color: var(--line);
  color: var(--selected);
}

span {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>