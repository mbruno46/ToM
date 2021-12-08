<template>
  <div ref="cell" class="cell" treecell-selected="false">
    <span :class="'tag icon ' + setIcon(isDir, name) + ' ' + (isMain ? 'main':'')"
      :style="'padding-left: ' + (0.5 + depth) +  'rem'" 
      @mousedown="mouseDown(path, name)"
      @mouseup="mouseUp(path)"
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
      />
    </div>
  </div>
</template>

<script>
import '@fortawesome/fontawesome-free/js/all.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { ref } from 'vue'
import utils from '@/hooks/utils.js'
import store from '@/hooks/store.js'

export default {
  name: "TreeCell",
  props: {
    path: String,
    content: Object,
    name: String,
    depth: Number,
    isDir: Boolean,
  },
  setup(props) {
    const isMain = ref(false);

    if (utils.getExtension(props.name) == 'tex') {
      if (utils.isMainTexFile(props.path)) {
        store.viewer.basepath = props.path.substring(0, props.path.lastIndexOf('.tex'));
        isMain.value = true;
      }
    }

    return {
      isMain,
    }
  },
  methods: {
    mouseDown(path, name) {
      let el = this.$refs.cell;
      let _el = document.querySelector('[treecell-selected="true"]');
      if (_el != null) {
        _el.children[0].classList.remove('selected');
        _el.setAttribute('treecell-selected','false');
      }
        
      el.children[0].classList.add('selected');
      el.setAttribute('treecell-selected','true');

      if (this.isDir) {
        el.children[1].classList.toggle('nested');
        el.children[0].classList.toggle('dir');
        el.children[0].classList.toggle('dir-open');
      } else {
        let e = utils.getExtension(name);
        if ((e == 'tex') || (e=='bib')) {
          if (store.editor.name != name) {
            store.editor.name = name;
            store.editor.path = path;
            store.editor.read = true;
          }
        }
        store.browser.moving = true;
        store.browser.file = path;
      }
    },
    mouseUp(path) {
      if (store.browser.moving) {
        if (this.isDir) utils.mv(store.browser.file, path);
        else {
          let p = path;
          utils.mv(store.browser.file, p.substring(0,p.lastIndexOf('/')));
        }
        store.browser.file = '#moved#';
      }
      store.browser.moving = false;
    },
    setIcon(isDir, name) {
      if (isDir) {
        return 'dir';
      } else {
        return utils.getExtension(name);
      }
    }
  }
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