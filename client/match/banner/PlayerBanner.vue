<template>
  <div :class="classes">
    <div class="matchHeader-bannerName">
      {{ name }}
      <span class="matchHeader-bannerClockText">
        <ClockIcon :is-player="isPlayer" />
        {{ clockTime }}
      </span>
    </div>
    <div class="matchHeader-bannerBarsWrapper">
      <div class="matchHeader-bannerBars">
        <template v-for="bar in bars">
          <div
            v-if="bar.empty"
            :key="bar.key"
            class="matchHeader-bannerBar matchHeader-bannerBar--empty"
          />
          <div
            v-else-if="bar.flipped"
            :key="bar.key"
            class="matchHeader-bannerBar matchHeader-bannerBar--flipped"
          />
          <div v-else :key="bar.key" class="matchHeader-bannerBar" />
        </template>
      </div>
      <div class="matchHeader-stationCardsNotice">
        <div class="matchHeader-stationCardCount">
          {{ stationCards.length }}
        </div>
        <div class="matchHeader-stationCardsText">
          Station cards
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const Vuex = require("vuex");
const matchHelpers = Vuex.createNamespacedHelpers("match");
const cardHelpers = Vuex.createNamespacedHelpers("card");
const resolveModuleWithPossibleDefault = require("../../utils/resolveModuleWithPossibleDefault.js");
const ClockIcon = resolveModuleWithPossibleDefault(require("./ClockIcon.vue"));

module.exports = {
  props: ["isPlayer", "reverse"],
  data() {
    return {
      clockTime: 0,
      clockUpdateIntervalId: null,
    };
  },
  computed: {
    ...matchHelpers.mapState(["opponentUser", "ownUser", "mode"]),
    ...matchHelpers.mapGetters([
      "allPlayerStationCards",
      "allOpponentStationCards",
      "maxStationCardCount",
      "opponentMaxStationCardCount",
      "playerClock",
      "opponentClock",
    ]),
    ...cardHelpers.mapState(["holdingCard"]),
    classes() {
      const classes = ["matchHeader-banner"];
      if (this.reverse) {
        classes.push("matchHeader-reverse");
      }

      if (this.isPlayer) {
        classes.push("matchHeader-playerBanner");

        if (this.holdingCard) {
          classes.push("matchHeader-opaque");
        }
      } else {
        classes.push("matchHeader-opponentBanner");
      }

      return classes;
    },
    name() {
      if (this.isPlayer) {
        return this.ownUser.name;
      } else {
        return this.opponentUser.name;
      }
    },
    stationCards() {
      return this.isPlayer
        ? this.allPlayerStationCards
        : this.allOpponentStationCards;
    },
    barCount() {
      return this.isPlayer
        ? this.maxStationCardCount
        : this.opponentMaxStationCardCount;
    },
    bars() {
      const stationCards = this.stationCards.slice();

      stationCards.push(
        ...range(this.barCount - stationCards.length).map((index) => ({
          key: `e:${index}`,
          empty: true,
        }))
      );

      const reverse = this.reverse;
      return stationCards
        .slice()
        .sort(
          (a, b) => getCardSortOrder(a, reverse) - getCardSortOrder(b, reverse)
        );
    },
    clock() {
      if (this.isPlayer) {
        return this.playerClock;
      }
      return this.opponentClock;
    },
  },
  mounted() {
    this.clockUpdateIntervalId = setInterval(() => {
      const time = this.clock.getTime();

      const seconds = Math.ceil(time / 1000) % 60;
      const secondsToShow = Math.max(0, seconds).toString();

      const minutes =
        (Math.ceil(time / 1000 / 60) % 60) - (seconds !== 0 ? 1 : 0);
      const minutesToShow = Math.max(minutes, 0).toString();

      this.clockTime = `${minutesToShow.padStart(
        2,
        "0"
      )}:${secondsToShow.padStart(2, "0")}`;
    }, 250);
  },
  destroyed() {
    clearInterval(this.clockUpdateIntervalId);
  },
  components: {
    ClockIcon,
  },
};

function getCardSortOrder({ flipped, empty }, reverse) {
  if (empty) return reverse ? 0 : 2;
  if (flipped) return 1;
  return reverse ? 2 : 0;
}

function range(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(i);
  }
  return result;
}
</script>

<style lang="scss">
@import "banner";

.matchHeader-banner {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border: 2px solid $bannerBorderColor;
  background: $bannerBackgroundColor;
  padding: 5px;
  margin-top: $bannerTopMargin;
  margin-left: $bannerSideMargin;
  height: $bannerHeight;
  box-sizing: border-box;

  &.matchHeader-playerBanner {
    border: 2px solid $bannerPlayerBorderColor;
    background: $bannerPlayerBackgroundColor;
  }

  &.matchHeader-opponentBanner {
    border: 2px solid $bannerOpponentBorderColor;
    background: $bannerOpponentBackgroundColor;
  }
  &:hover {
    z-index: 4;
  }
}

.matchHeader-reverse {
  margin: 0 $bannerSideMargin 10px 0;
  top: auto;
  left: auto;
  bottom: 0;
  right: 0;
  flex-direction: row-reverse;
}

.matchHeader-opaque {
  transition: opacity 0.1s;
  opacity: 0.4;
  pointer-events: none;
}

.matchHeader-bannerName {
  font-family: "Libel Suit", sans-serif;
  letter-spacing: 0.1em;
  font-size: 28px;
  margin-right: $bannerInnerSideMargin;
  justify-content: flex-start;

  .matchHeader-playerBanner & {
    color: $playerColor;
  }

  .matchHeader-opponentBanner & {
    color: $opponentColor;
  }

  .matchHeader-reverse & {
    margin-right: 0;
    margin-left: $bannerInnerSideMargin;
    justify-content: flex-end;
  }
}

.matchHeader-bannerBarsWrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  .matchHeader-reverse & {
    flex-direction: row-reverse;
    justify-content: flex-end;
  }
}

.matchHeader-bannerBars {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .matchHeader-reverse & {
    justify-content: flex-end;
  }
}

.matchHeader-bannerBar {
  width: 12px;
  height: 28px;
  margin: 0 1px;

  .matchHeader-playerBanner & {
    border: 2px solid $playerSecondaryColor;
    background: $playerColor;
  }

  .matchHeader-opponentBanner & {
    border: 2px solid $opponentSecondaryColor;
    background: $opponentColor;
  }
}

.matchHeader-bannerBar.matchHeader-bannerBar--flipped {
  background: transparent;
}

.matchHeader-bannerBar.matchHeader-bannerBar--empty {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.05);
}

.matchHeader-stationCardsNotice {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  text-transform: uppercase;
  font-weight: 100;
  font-size: 13px;
  font-family: "Space mono", sans-serif;
  line-height: 102%;

  margin: 10px 5px 10px 15px;

  .matchHeader-reverse & {
    margin: 10px 15px 10px 5px;
  }

  .matchHeader-playerBanner & {
    color: $bannerPlayerTextColor;
  }

  .matchHeader-opponentBanner & {
    color: $bannerOpponentTextColor;
  }
}

.matchHeader-stationCardCount {
  position: relative;
  bottom: 2px;
  font-size: 30px;
  margin: 0 6px 0 0;
}

.matchHeader-stationCardsText {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-transform: uppercase;
  font-weight: 100;
  font-size: 13px;
  font-family: "Space mono", sans-serif;
  line-height: 102%;
  width: 56px;
  height: 0; /* It should not have an effect on the container height, so that's why its zero */
}

.matchHeader-bannerClockText {
  display: inline-block;
  min-width: 84px;
  text-align: left;
  margin: 0 0 0 4px;
}

// Phones in landscape mode, by Jim 2021-03-08
@media (max-height: 500px) and (orientation: landscape) {
  .matchHeader-bannerClockText {min-width: 50px;}
}


</style>
