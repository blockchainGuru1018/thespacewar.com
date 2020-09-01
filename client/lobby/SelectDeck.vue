<template>
  <div class="selectDeck-container">
    Deck:
    <select
      id="currentDeck"
      v-model="selectedDeck"
      class="deckDropDown"
      name="currentDeck"
      @change="onChange($event)"
    >
      <option :value="'Regular'">Regular (advanced play)</option>
      <option :value="'TheSwarm'" default>The Swarm (easy play)</option>
      <option v-if="unitedStarsDeck" :value="'UnitedStars'"
      >United Stars
      </option>
    </select>
  </div>
</template>

<script>
import featureToggles from "../utils/featureToggles.js";

export default {
  data: function () {
    return {
      selectedDeck: "TheSwarm",
    };
  },
  computed: {
    unitedStarsDeck() {
      return featureToggles.isEnabled("unitedStarsDeck");
    },
  },
  mounted() {
    this.selectedDeck =
      JSON.parse(localStorage.getItem("active-deck")) || "TheSwarm";
    if (!this.unitedStarsDeck && this.selectedDeck === "UnitedStars") {
      this.selectedDeck = "TheSwarm";
    }
  },
  methods: {
    onChange(event) {
      this.selectedDeck = event.target.value;
      localStorage.setItem("active-deck", JSON.stringify(event.target.value));
    },
  },
};
</script>

<style scoped lang="scss">
.selectDeck-container {
  font-family: "Space Mono", monospace;
  color: white;
  padding: 10px;
  height: 20px;
}

.deckDropDown {
  font-family: "Space Mono", monospace;
  color: white;
  font-size: 16px;
  background: rgba(0, 0, 0, 0.5);
}
</style>
