<template>
  <div>
    <portal to="stationDrawRow">
      <span class="stationRowDescription descriptionText">
        {{ drawRowText }}
      </span>
    </portal>
    <portal to="stationActionRow">
      <span class="stationRowDescription descriptionText">
        {{ actionRowText }}
      </span>
    </portal>
    <portal to="stationHandSizeRow">
      <span class="stationRowDescription descriptionText">
        {{ handSizeRowText }}
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
      return `Draw ${cardsToDrawInDrawPhase} ${pluralize(
        "card",
        cardsToDrawInDrawPhase
      )} each turn`;
    },
    actionRowText() {
      const actionPoints = this.actionPointsFromStationCards;
      return `Start turn with ${actionPoints} action ${pluralize(
        "point",
        actionPoints
      )}`;
    },
    handSizeRowText() {
      const maxHandSize = this.maxHandSize;
      return `Max ${maxHandSize} ${pluralize("card", maxHandSize)} on hand`;
    },
  },
};

function pluralize(word, count) {
  return count === 1 ? word : word + "s";
}
</script>

<style lang="scss" scoped>
@import "guiDescription";
</style>
