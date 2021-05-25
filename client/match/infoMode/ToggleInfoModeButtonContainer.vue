<template>
  <ToggleInfoModeButton @toggleInfoMode="toggle(); clikedButton($event)" />
</template>
<script>
import ToggleInfoModeButton from "./ToggleInfoModeButton.vue";
import Vuex from "vuex";

const infoModeHelpers = Vuex.createNamespacedHelpers("infoMode");

export default {
  components: { ToggleInfoModeButton },
  methods: {
    ...infoModeHelpers.mapActions(["toggle"]),

    clikedButton(e)
    {
      console.log("llego a ToggleInfoModeButtonContainer:",e);
      this.$emit('changeShowingTutorial',e);
    },

  },
};
</script>
