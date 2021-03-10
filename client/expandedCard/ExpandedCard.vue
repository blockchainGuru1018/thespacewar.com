<template>
  <div
    v-if="cardData || commander"
    ref="expandedCard"
    class="expandedCard"
    tabindex="0"
    @keydown.esc="hideExpandedCard"
    @click.self="hideExpandedCard"
    @mouseup.right="hideExpandedCard"
    @contextmenu.prevent="(e) => e.preventDefault()"
  >
    <img
      :src="cardImageUrl"
      class="expandedCard-image"
      alt="expanded card image"
    />
  </div>
</template>
<script>
const Vuex = require("vuex");
const expandedCardHelpers = Vuex.createNamespacedHelpers("expandedCard");

module.exports = {
  computed: {
    ...expandedCardHelpers.mapState(["cardData", "commander"]),
    ...expandedCardHelpers.mapGetters(["cardImageUrl"]),
  },
  watch: {
    cardData() {
      if (this.cardData) {
        setTimeout(() => {
          this.$refs.expandedCard.focus();
        });
      }
    },
    commander() {
      if (this.commander) {
        setTimeout(() => {
          this.$refs.expandedCard.focus();
        });
      }
    },
  },
  methods: {
    ...expandedCardHelpers.mapActions(["hideExpandedCard"]),
  },
};
</script>
<style scoped lang="scss">
@import "../match/cardVariables";

.expandedCard {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
}

.expandedCard-image {
  width: $expandedCardWidth;
  height: $expandedCardHeight;
  pointer-events: none;
}

// Phones in landscape mode, by Jim 2021-03-10
// Must be a better way to do this and set max-height 50px less than screen height
@media (max-height: 700px) {.expandedCard-image {max-height: 650px;} }
@media (max-height: 650px) {.expandedCard-image {max-height: 600px;} }
@media (max-height: 600px) {.expandedCard-image {max-height: 550px;} }
@media (max-height: 550px) {.expandedCard-image {max-height: 500px;} }
@media (max-height: 500px) {.expandedCard-image {max-height: 450px;} }
@media (max-height: 450px) {.expandedCard-image {max-height: 400px;} }
@media (max-height: 400px) {.expandedCard-image {max-height: 350px;} }
@media (max-height: 350px) {.expandedCard-image {max-height: 300px;} }
@media (max-height: 300px) {.expandedCard-image {max-height: 250px;} }


</style>
