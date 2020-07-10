<template>
  <div
    v-longpress="() => longpress(commander)"
    :class="classes"
    :style="style"
    title="Long press over any card to expand it"
    @click="$emit('select')"
  />
</template>
<script>
const Vuex = require("vuex");
const expandedCardHelpers = Vuex.createNamespacedHelpers("expandedCard");
const getCardImageUrl = require("../../utils/getCardImageUrl.js");
const longpress = require("../../utils/longpress.js");

module.exports = {
  props: ["commander", "selected", "expandable", "turnedAround"],
  computed: {
    classes() {
      const classes = ["commanderCard", "card"];
      if (this.selected) {
        classes.push("commanderCard--selected");
      }
      if (this.turnedAround) {
        classes.push("card--turnedAround");
      }
      if (this.expandable) {
        classes.push("card--expandable");
      }
      return classes;
    },
    style() {
      return {
        backgroundImage: `url(${getCardImageUrl.forCommander(this.commander)})`,
      };
    },
  },
  methods: {
    ...expandedCardHelpers.mapActions(["expandCommanderCard"]),
    longpress() {
      if (!this.expandable) return;

      this.expandCommanderCard(this.commander);
    },
  },
  directives: {
    longpress,
  },
};
</script>
<style lang="scss">
.commanderCard {
  margin: 0 10px;
  z-index: 1;
}

.commanderCard-name {
  font-size: 26px;
  font-family: "Space mono", monospace;
  color: white;
  z-index: 1;
  margin: auto auto;
  text-align: center;
  text-shadow: 0px -2px 0px rgba(0, 0, 0, 0.5), 0px 2px 0px rgba(0, 0, 0, 0.5);
  letter-spacing: -0.1em;
  line-height: 90%;

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    content: "";
    background: rgba(0, 0, 0, 0.6);
    z-index: -1;
  }
}
</style>
