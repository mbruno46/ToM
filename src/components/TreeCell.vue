<template>
  <div ref="cell" class="cell" treecell-selected="false">
    <span class="tag"
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
// import '@fortawesome/fontawesome-free/js/all.min.js'
// import '@fortawesome/fontawesome-free/css/all.min.css'
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

    return {
      isDir,
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
        // if (el.children[1].classList.contains('nested')) {
        //   this.icon = 'fa-angle-right'
        // } else {
        //   this.icon = 'fa-angle-down'
        // }
      } else {
        console.log(path, name, utils.getExtension(name))
        if (utils.getExtension(name) == 'tex') {
          store.editor.name = name;
          store.editor.path = path;
          store.editor.read = true;
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
}

.tag {
  width:100%; 
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

/* .icon::before {
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
} */
/* .icon:before {
    display: inline-block;
    margin-right: .5em;
    font-family: Font Awesome 5 Free;
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transform: translate(0, 0);
} */

/* .dir::before {
  font-family: "Font Awesome 5 Free";
  font-weight: 400;
  content: "\f095";
} */

/* .dir-open::before {
  content: "\\/";
} */

/* .file::before {
  content: "-";
  display: inline-block;
} */

.selected {
  background-color: var(--line);
  color: var(--selected);
}

</style>