<template>
  <div ref="cell" class="cell" treecell-selected="false">
    <span :class="'tag icon ' + setIcon(isDir, name) + ' ' + (isMain ? 'main':'')"
      :style="'padding-left: ' + (0.5 + depth) +  'rem'" 
      @click="clicked(path, name)"
      >
      {{name}}
    </span>
    <div v-if="isDir" class="nested">
      <TreeCell v-for="(value,key) in content" 
        :key="value['path']"
        :path="value['path']"
        :content="value['content']" 
        :name="key"
        :depth="value['depth']"/>
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
  },
  setup(props) {
    const isDir = ref(Object.keys(props.content).length !== 0);
    const isMain = ref(false);
    if (utils.getExtension(props.name) == 'tex') {
      console.log(props.path, utils.isMainTexFile(props.path))
      if (utils.isMainTexFile(props.path)) {
        store.viewer.basepath = props.path.substring(0, props.path.lastIndexOf('.tex'));
        isMain.value = true;
      }
    }

    return {
      isDir,
      isMain,
    }
  },
  methods: {
    clicked(path, name) {
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
        console.log(path, name, utils.getExtension(name))
        if (utils.getExtension(name) == 'tex') {
          store.editor.name = name;
          store.editor.path = path;
          store.editor.read = true;
        }
      }
    },
    setIcon(isDir, name) {
      if (isDir) {
        return 'dir';
      } else {
        if (utils.getExtension(name) == 'tex') {
          return 'file';
        } else if (utils.getExtension(name) == 'pdf') {
          return 'pdf';
        }
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
/* .icon:before {
    display: inline-block;
    margin-right: .5em;
    font-family: "Font Awesome 5 Free";
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transform: translate(0, 0);
} */

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
.file::before {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  content: "\f15c";
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

</style>