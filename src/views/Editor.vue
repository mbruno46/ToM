<template>
  <Toolbar>
    <AppButton icon="fa-folder-open" title="Open notebook"/>
  </Toolbar>
  <code-editor ref="editor"/>
</template>

<script>
import Toolbar from '@/components/Toolbar.vue';
import AppButton from '@/components/AppButton.vue';
import CodeEditor from '@/components/CodeEditor.vue';

export default {
  components: {
    AppButton,
    Toolbar,
    CodeEditor,
  },
  methods: {
    focus: function() {
      this.$refs.editor.focus();
    }
  }
}
</script>