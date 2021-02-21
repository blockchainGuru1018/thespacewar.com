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
      <option :value="'Regular'">The Terrans (advanced play)</option>
      <option :value="'TheSwarm'" default>The Swarm (easy play)</option>
      <option v-if="unitedStarsDeck && customDeckName" :value="'UnitedStars'"
      >United Stars (advanced play)
      </option>
      <option v-if="customDeck" :value="'CustomDeck'">
        {{ customDeckName }}
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
    customDeck() {
      return featureToggles.isEnabled("customDeck");
    },
    customDeckName() {

      function getCookie(name) {
        var dc, prefix, begin, end;
        dc = document.cookie;
        prefix = name + "=";
        begin = dc.indexOf("; " + prefix);
        end = dc.length;
        if (begin !== -1) {
          begin += 2;
        } else {
          begin = dc.indexOf(prefix);
          if (begin === -1 || begin !== 0) return null;
        }

        if (dc.indexOf(";", begin) !== -1) {
          end = dc.indexOf(";", begin);
        }

        return dc.substring(begin + prefix.length, end);
      }

      let constructedDeck = {};
      const rawConstructedDeckCookie = getCookie("constructed_deck");
      if (rawConstructedDeckCookie) {
        constructedDeck = JSON.parse(
            decodeURIComponent(`${rawConstructedDeckCookie}`)
        );

        return constructedDeck.deck_name;

      }
    }
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
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
}
</style>
