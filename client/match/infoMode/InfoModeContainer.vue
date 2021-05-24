<template>
  <!-- <portal v-if="visible || shouldDisplayTutorialSuggestion" to="match"> -->
    <InfoMode
      v-if="visible || shouldDisplayTutorialSuggestion"
      :show-tutorial-suggestion="shouldDisplayTutorialSuggestion"
      @hide="hide"
      @toggleInfoMode="toggleModalGame"
    />
  <!-- </portal> -->
</template>
<script>
import InfoMode from "./InfoMode.vue";
import Vuex from "vuex";

const infoModeHelpers = Vuex.createNamespacedHelpers("infoMode");

export default {
  components: { InfoMode },
  computed: {
    ...infoModeHelpers.mapState(["visible", "showTutorialSuggestion"]),
    ...infoModeHelpers.mapGetters(["shouldDisplayTutorialSuggestion"]),
  },
  methods: {
    ...infoModeHelpers.mapActions(["hide"]),

    toggleModalGame()
    {
      this.$emit("toggleModalGame");
      console.log("Desde InfoModeContainer!");
    }

  },
};
</script>
