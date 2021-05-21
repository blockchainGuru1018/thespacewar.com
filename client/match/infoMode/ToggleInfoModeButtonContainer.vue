<template>
  <ToggleInfoModeButton @toggleInfoMode="toggle(); clikedButton()" />
</template>
<script>
import ToggleInfoModeButton from "./ToggleInfoModeButton.vue";
import Vuex from "vuex";

const infoModeHelpers = Vuex.createNamespacedHelpers("infoMode");

export default {
  components: { ToggleInfoModeButton },
  methods: {
    ...infoModeHelpers.mapActions(["toggle"]),

    clikedButton()
    {
      console.log("llego a ToggleInfoModeButtonContainer");
      this.$emit('changeShowingTutorial');
    },

  },
};
</script>
