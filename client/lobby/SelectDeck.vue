<template>
  <div class="selectDeck-container">
    Current Deck:
    <select
      id="currentDeck"
      v-model="selectedDeck"
      class="deckDropDown"
      name="currentDeck"
      @change="onChange($event)"
    >
      <option :value="'Regular'">Regular</option>
      <option :value="'TheSwarm'">The Swarm</option>
    </select>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      selectedDeck: "Regular",
    };
  },
  mounted() {
    this.selectedDeck =
      JSON.parse(localStorage.getItem("active-deck")) || "Regular";
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
