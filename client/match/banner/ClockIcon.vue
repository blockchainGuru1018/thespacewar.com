<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" :class="classes">
    <path
      d="M30 0c-.553 0-1 .447-1 1v13.292c0 .553.447 1 1 1s1-.447 1-1V2.018C45.979 2.546 58 14.896 58 30c0 15.439-12.561 28-28 28S2 45.439 2 30c0-7.46 2.9-14.479 8.166-19.764a.9989.9989 0 0 0-.002-1.414c-.392-.388-1.024-.388-1.414.002C3.107 14.486 0 22.007 0 30c0 16.542 13.458 30 30 30s30-13.458 30-30S46.542 0 30 0z"
    />
    <path
      d="M28.555 33.532c.668.919 1.746 1.468 2.883 1.468.95 0 1.845-.371 2.518-1.044.737-.737 1.114-1.756 1.033-2.797s-.612-1.99-1.459-2.606L20.586 19.19c-.396-.286-.945-.242-1.293.104a1 1 0 0 0-.104 1.293l9.366 12.945z"
    />
  </svg>
</template>
<script>
module.exports = {
  props: ["isPlayer"],
  computed: {
    classes() {
      return [
        "clockIcon",
        this.isPlayer ? "clockIcon--player" : "clockIcon--opponent",
      ];
    },
  },
};
</script>
<style lang="scss">
@import "banner";

.clockIcon {
  width: 18px;
  height: 18px;
  margin: 0 -2px 0 0;
  padding: 0;
  position: relative;
  bottom: 2px;
}

.clockIcon--player {
  fill: $playerColor;
}

.clockIcon--opponent {
  fill: $opponentColor;
}

// Phones in landscape mode, by Jim 2021-03-08
@media (max-height: 500px) and (orientation: landscape) {
  .clockIcon {
    width: 12px;
    height: 12px;
    bottom: 0px;
  }
}

</style>
