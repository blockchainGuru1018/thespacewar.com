<template>
  <div class="logMenu">
    <div class="escapeMenu-logOption escapeMenu-option">
      <pre>
                {{ log }}
            </pre
      >
    </div>
    <button class="escapeMenu-option" @click="showDebugOptions">
      Back
    </button>
  </div>
</template>
<script>
import Vuex from "vuex";
import localGameDataFacade from "../../../utils/localGameDataFacade.js";
import ajax from "../../../utils/ajax.js";
import { ViewNames } from "../views.js";

const escapeMenuHelpers = Vuex.createNamespacedHelpers("escapeMenu");

export default {
  data() {
    return {
      log: "",
    };
  },
  async mounted() {
    this.log = "LOADING LOG";
    const { text } = await ajax.jsonPost("/master-log", {
      password: localGameDataFacade.DebugPassword.get(),
    });
    this.log = text;
  },
  methods: {
    ...escapeMenuHelpers.mapActions(["selectView"]),
    showDebugOptions() {
      this.selectView(ViewNames.debug);
    },
  },
};
</script>
