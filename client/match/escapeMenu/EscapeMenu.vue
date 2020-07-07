<template>
  <div v-if="visible" class="escapeMenu-wrapper">
    <div class="escapeMenu-overlay" @click.self="hide" />
    <component :is="currentMenuView" class="escapeMenu" />
  </div>
</template>
<script>
import { views, ViewNames } from "./views.js";

const Vuex = require("vuex");
const escapeMenuHelpers = Vuex.createNamespacedHelpers("escapeMenu");

module.exports = {
  computed: {
    ...escapeMenuHelpers.mapState(["view", "visible"]),
    currentMenuView() {
      return views[this.view];
    },
  },
  watch: {
    async visible() {
      this.selectView(ViewNames.main);

      if (this.visible) {
        await this.validateDebug();
      }
    },
  },
  methods: {
    ...escapeMenuHelpers.mapActions(["hide", "validateDebug", "selectView"]),
  },
};
</script>
<style lang="scss" src="./_escapeMenu.scss" />
