<template>
  <div>
    <portal to="stationDrawRow">
      <span class="stationRowDescription descriptionText" v-html="drawRowText">
      </span>
    </portal>
    <portal to="stationActionRow">
      <span
        class="stationRowDescription descriptionText"
        v-html="actionRowText"
      >
      </span>
    </portal>
    <portal to="stationHandSizeRow">
      <span
        class="stationRowDescription descriptionText"
        v-html="handSizeRowText"
      >
      </span>
    </portal>
  </div>
</template>

<script>
const Vuex = require("vuex");
const matchHelpers = Vuex.createNamespacedHelpers("match");

export default {
  name: "StationDescriptions",
  computed: {
    ...matchHelpers.mapGetters([
      "cardsToDrawInDrawPhase",
      "actionPointsFromStationCards",
      "maxHandSize",
    ]),
    drawRowText() {
      const cardsToDrawInDrawPhase = this.cardsToDrawInDrawPhase;
      return `<span> Draw <b style="color: rgba(180, 180, 180, 0.8) !important;"> ${cardsToDrawInDrawPhase} </b> ${pluralize(
        "card",
        cardsToDrawInDrawPhase
      )} each turn </span>`;
    },
    actionRowText() {
      const actionPoints = this.actionPointsFromStationCards;
      return `<span>Start turn with <b style="color: rgba(180, 180, 180, 0.8) !important;">${actionPoints} </b>action ${pluralize(
        "point",
        actionPoints
      )} </span>`;
    },
    handSizeRowText() {
      const maxHandSize = this.maxHandSize;
      return `<span> Max <b style="color: rgba(180, 180, 180, 0.8) !important;">${maxHandSize}</b> ${pluralize(
        "card",
        maxHandSize
      )} on hand </span>`;
    },
  },
};

function pluralize(word, count) {
  return count === 1 ? word : word + "s";
}
</script>

<style lang="scss" scoped>
@import "guiDescription";

.focusedText {
  color: rgba(180, 180, 180, 1) !important;
}
</style>
