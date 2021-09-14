<template>
  <div ref="panel" class="panel" v-show="active"
    :style="`left: ${pos.x}; top: ${pos.y}; max-width: calc(100% - ${pos.y});`"
    @keydown="handleKeyDown">
    <span class="entry" v-for="(val, idx) in suggestions" 
      :key="idx" :class="`entry ` + ((current == idx) ? 'selected':'')"
      @click="clicked($event, val)">
      {{val}}
    </span>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import {AutoComplete} from '@/hooks/highlight'

var ac = AutoComplete();
var char_width = 0;

export default {
  emits: ['autocomplete-choice'],
  setup(props, { emit }) {
    const panel = ref(null);
    const pos = ref({x:0, y:0});
    const suggestions = ref([]);
    const active = ref(false);
    const current = ref(-1);

    onMounted(() => {
      let s = document.createElement('span');
      let e = document.getElementsByClassName('text-editor')[0];
      s.classList.add('span-char-width');
      s.textContent = 'test string';
      e.appendChild(s);
      char_width = s.offsetWidth / 11;
      e.removeChild(s);
    });

    function launch(text, x, y) {
      let suggestion = ac.check(text);
      console.log(suggestion);
      if (suggestion.active) {
        suggestions.value = suggestion.suggestions;
        current.value = -1;
        active.value = true;

        let n = suggestion.filter.length;
        pos.value.x = `calc(${x}px - ${n*char_width}px - 0.2rem)`;
        pos.value.y = `calc(${y}px + 1.2rem)`;
      } else {
        active.value = false;
      }
    }

    function choose(val) {
      active.value = false;
      emit('autocomplete-choice', val)
    }

    return {
      panel,
      pos,
      suggestions,
      active,
      current,
      launch,
      choose,
    }
  },
  methods: {
    clicked(event, val) {
      event.stopPropagation();
      this.choose(val);
    },
    isActive() {
      return this.active;
    },
    handleKeyDown(event) {
      event.stopPropagation();
      event.preventDefault();

      if (event.key == "ArrowDown") {
        this.current += 1;
        this.current = this.current % this.suggestions.length;
      } else if (event.key == "ArrowUp") {
        this.current -= 1;
        this.current += (this.current<0) ? this.suggestions.length : 0;
      } else if (event.key == "Enter") {
        this.choose(this.suggestions[this.current]);
      }
    }
  }
}
</script>

<style scoped>
.panel {
  font-family: 'Source Code Pro', monospace;
  font-size: 1rem;
  background-color: var(--bg0);
  border: 1px solid var(--fg);
  margin: 0;
  padding: 0.2rem;
  z-index: 2;
  position: absolute;
  display: flex;
  flex-flow: column;
  min-width: minmax(fit-content, 8rem);
  min-height: minmax(fit-content, 8rem);
}

.entry {
  width: 100%;
  color: var(--selected);
}

.selected {
  background-color: var(--electric-blue);
}

.span-char-width {
  font-family: 'Source Code Pro', monospace;
  font-size: 1rem;
  padding: 0;
  margin: 0;
  position: absolute;
  left: -100px;
  top: -100px;
}
</style>