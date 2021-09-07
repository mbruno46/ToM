<template>
  <div ref="cell" class="cell" treecell-selected="false">
    <span class="tag"
      :class="(isDir) ? 'dir' : 'file'"
      :style="'padding-left: ' + depth +  'rem'" 
      @click="clicked">
      {{name}}
    </span>
    <div v-if="isDir" class="nested">
      <TreeCell v-for="(value,key) in content" 
        :key="value['path']" 
        :content="value['content']" 
        :name="key"
        :depth="value['depth']"/>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue'

export default {
  name: "TreeCell",
  props: {
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
    clicked() {
      let el = this.$refs.cell;
      let _el = document.querySelector('[treecell-selected="true"]');
      if (_el != null) {
        _el.children[0].classList.remove('selected');
        _el.setAttribute('treecell-selected','false');
      }
        
      el.children[0].classList.add('selected');
      el.setAttribute('treecell-selected','true');

      if (this.isDir) {
        el.children[0].classList.toggle('dir-open');
        el.children[1].classList.toggle('nested');
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
}

.dir::before {
  content:  ">";
  display: inline-block;
}
.dir-open::before {
  content: "\\/";
}

.file::before {
  content: "-";
  display: inline-block;
}

.selected {
  background-color: var(--line);
  color: var(--selected);
}

</style>