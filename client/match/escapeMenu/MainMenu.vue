<template>
  <div v-if="visible">
    <button
      class="escapeMenu-option"
      title="If something appears to be wrong, this might fix it. No data will be lost when you reload the page!"
      @click="hideAnd(reloadPage)"
    >
      Solve Problems (saves and reloads page)
    </button>
    <button class="escapeMenu-option">
      Sound:
      <MasterGainSlider />
    </button>
    <button
      class="escapeMenu-retreat escapeMenu-option"
      @click="hideAnd(retreat)"
    >
      Retreat
    </button>
    <button
      v-if="validatedDebug"
      class="escapeMenu-fadedOption escapeMenu-option"
      @click="showDebugOptions"
    >
      Debug options
    </button>
  </div>
</template>
<script>
import { ViewNames } from "./views.js";
import MasterGainSlider from "../../audio/MasterGainSlider.vue";

const Vuex = require("vuex");
const escapeMenuHelpers = Vuex.createNamespacedHelpers("escapeMenu");
const matchHelpers = Vuex.createNamespacedHelpers("match");

module.exports = {
  name: "MainMenu",
  computed: {
    ...escapeMenuHelpers.mapState(["view", "validatedDebug"]),
    visible() {
      return this.view === ViewNames.main;
    },
  },
  methods: {
    ...escapeMenuHelpers.mapActions(["hide", "selectView"]),
    ...matchHelpers.mapActions(["retreat"]),
    hideAnd(method) {
      this.hide();
      method();
    },
    reloadPage() {
      window.location.reload();
    },
    showDebugOptions() {
      this.selectView(ViewNames.debug);
    },
  },
  components: {
    MasterGainSlider,
  },
};
</script>
