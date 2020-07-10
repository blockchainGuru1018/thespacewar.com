<template>
  <div v-if="guideTextContainerVisible" class="guideTextContainer">
    <!-- WAITING FOR OPPONENT REQUIREMENT texts -->
    <div
      v-if="waitingForOtherPlayerToFinishRequirements"
      class="guideText-waitingForOtherPlayer guideText guideText--small"
    >
      <template v-if="waitingRequirement.reason === 'emptyDeck'">
        Your opponent is dealing damage to your station
      </template>
      <template v-else>
        Waiting for other player
      </template>
    </div>

    <!-- ACTION and REQUIREMENT texts -->
    <div v-else-if="actionGuideText" class="guideText guideText--small">
      <div
        :style="cardStyle"
        class="guideTextCardWrapper card"
        @click="showEnlargedCard"
      >
        <div class="enlargeIcon enlargeIcon--small" />
      </div>
      {{ actionGuideText }}
    </div>
    <div v-else-if="requirementGuideText" class="guideText guideText--small">
      <div
        class="guideTextCardWrapper card"
        :style="cardStyle"
        @click="showEnlargedCard"
      >
        <div class="enlargeIcon enlargeIcon--small" />
      </div>
      {{ requirementGuideText }}
      <SkipDrawCard v-if="shouldShowSkipDrawCard" />
    </div>

    <!-- STARTING GAME texts -->
    <template v-else-if="selectingStartingStationCards">
      <div
        v-if="startingStationCardsToPutDownCount > 0"
        class="guideText-wrapper"
      >
        <div class="guideText">
          Expand your space station with
          {{ startingStationCardsToPutDownCount }}
          {{ startingStationCardsToPutDownCount === 1 ? "card" : "cards" }}
        </div>
        <div class="guideText-subText">
          You lose when all your station cards are damaged
        </div>
      </div>
      <div
        v-else-if="playerIsReady"
        class="guideText-waitingForOtherPlayer guideText guideText--small"
      >
        Waiting for other player
      </div>
    </template>
    <div
      v-else-if="waitingForOtherPlayerToSelectStartingPlayer"
      class="guideText-waitingForOtherPlayer guideText guideText--small"
    >
      Your opponent is choosing who goes f
      <span style="letter-spacing: 0.1em;">ir</span>
      st
    </div>

    <!-- SELECT STATION CARDS FOR ATTACK texts -->
    <div v-else-if="numberOfStationCardsToSelect > 0" class="guideText">
      Select {{ numberOfStationCardsToSelect }} more station
      {{ numberOfStationCardsToSelect === 1 ? "card" : "cards" }}
    </div>

    <!-- LAST STAND texts -->
    <div v-else-if="opponentLastStandText">
      <div class="guideText">
        Your opponent is making a last stand
      </div>
      <div class="guideText-subText">
        {{ opponentLastStandText }}
      </div>
    </div>
    <div v-else-if="lastStandText">
      <div class="guideText">
        Last stand
      </div>
      <div class="guideText-subText">
        {{ lastStandText }}
      </div>
    </div>

    <!-- TURN CONTROL texts -->
    <div v-else-if="opponentHasControlOfPlayersTurn" class="guideText-wrapper">
      <div class="guideText">
        Your opponent has taken control
      </div>
      <div class="guideText-subText">
        wait to have it back
      </div>
    </div>

    <!-- PHASE texts -->
    <div v-else-if="phase === PHASES.draw" class="guideText-wrapper">
      <div class="guideText-drawPhaseText guideText">
        Your turn
      </div>
      <div
        class="guideText-drawPhaseSubText guideText-drawCard guideText-subText"
      >
        {{ drawCardOrMillText }}
      </div>
    </div>
    <div
      v-else-if="phase === PHASES.preparation"
      class="guideText-discardDurationCards guideText guideText--small"
    >
      Discard any duration card you don't want to pay for
    </div>
    <div
      v-else-if="inDiscardPhaseAndMustDiscardCard"
      class="guideText-drawCard guideText guideText--small"
    >
      Discard
      {{
        amountOfCardsToDiscard +
        (amountOfCardsToDiscard === 1 ? " card" : " cards")
      }}
      to continue
    </div>
    <template v-else-if="showActionPoints">
      <div class="playerActionPoints">
        {{ playerActionPointsText }}
      </div>
    </template>

    <!-- WAIT PHASE and TURN CONTROL texts -->
    <div v-else-if="canToggleControlOfTurn" class="guideText-wrapper">
      <div class="guideText">
        {{ textOnWaitPhase }}
      </div>
      <div class="guideText-subText">
        <button
          class="toggleControlOfTurn darkButton"
          title="Or press space to toggle control"
          @click="toggleControlOfTurn"
          @keydown.space.stop.prevent="toggleControlOfTurn"
        >
          {{ turnControlButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
const Vuex = require("vuex");
const resolveModuleWithPossibleDefault = require("../../../utils/resolveModuleWithPossibleDefault.js");
const SkipDrawCard = resolveModuleWithPossibleDefault(
  require("../../hud/SkipDrawCard.vue")
);
const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers(
  "match"
);
const { mapGetters: mapPermissionGetters } = Vuex.createNamespacedHelpers(
  "permission"
);
const cardHelpers = Vuex.createNamespacedHelpers("card");
const ghostHelpers = Vuex.createNamespacedHelpers("ghost");
const requirementHelpers = Vuex.createNamespacedHelpers("requirement");
const infoModeHelpers = Vuex.createNamespacedHelpers("infoMode");
const MatchMode = require("../../../../shared/match/MatchMode.js");
const LastStand = require("../../../../shared/match/LastStand.js");
const { PHASES } = require("../../phases.js");
const FatalError = require("../../../../shared/card/FatalError.js");
import featureToggles from "../../../utils/featureToggles.js";

export default {
  components: {
    SkipDrawCard,
  },
  data() {
    return {
      lastStandRemainingSeconds: Math.round(LastStand.LastStandLength / 1000),
      lastStandUpdateIntervalId: null,
    };
  },
  computed: {
    ...mapState([
      "mode",
      "phase",
      "ownUser",
      "selectedDefendingStationCards",
      "playerCardsOnHand",
      "readyPlayerIds",
      "lastStandInfo",
    ]),
    ...mapGetters([
      "maxHandSize",
      "actionPoints2",
      "attackerCard",
      "amountOfCardsToDiscard",
      "turnControl",
      "startingStationCardsToPutDownCount",
      "choosingStartingPlayer",
      "isOwnTurn",
      "playerRuleService",
      "lastStand",
    ]),
    ...requirementHelpers.mapGetters([
      "waitingForOtherPlayerToFinishRequirements",
      "waitingRequirement",
      "firstRequirement",
      "firstRequirementIsDiscardCard",
      "firstRequirementIsDamageStationCard",
      "firstRequirementIsDamageShieldCard",
      "firstRequirementIsDrawCard",
      "cardsLeftToSelect",
      "countInFirstRequirement",
      "requirementCardImageUrl",
    ]),
    ...cardHelpers.mapState(["activeAction"]),
    ...cardHelpers.mapGetters(["activeActionCardImageUrl"]),
    ...mapPermissionGetters([
      "canMill",
      "opponentHasControlOfPlayersTurn",
      "playerHasControlOfOpponentsTurn",
    ]),
    ...ghostHelpers.mapGetters(["activateEventCardGhostVisible"]),
    ...infoModeHelpers.mapState({
      infoModeVisible: "visible",
    }),
    canToggleControlOfTurn() {
      if (featureToggles.isEnabled("the-swarm-cant-take-control")) {
        return (
          this.turnControl.canToggleControlOfTurn() &&
          !this.turnControl.isPlayingWithTheSwarmDeck()
        );
      } else {
        return this.turnControl.canToggleControlOfTurn();
      }
    },
    guideTextContainerVisible() {
      if (this.choosingStartingPlayer) return false;
      if (this.activateEventCardGhostVisible) return false;
      if (this.infoModeVisible) return false;

      return true;
    },
    playerIsReady() {
      return this.readyPlayerIds.includes(this.ownUser.id);
    },
    waitingForOtherPlayerToSelectStartingPlayer() {
      return this.mode === MatchMode.chooseStartingPlayer && !this.isOwnTurn;
    },
    selectingStartingStationCards() {
      return this.mode === MatchMode.selectStationCards;
    },
    showActionPoints() {
      return ["action"].includes(this.phase);
    },
    playerActionPointsText() {
      return `${this.actionPoints2} action ${pluralize(
        "point",
        this.actionPoints2
      )} remaining`;
    },
    PHASES() {
      return PHASES;
    },
    lastStandText() {
      if (
        this.playerHasControlOfOpponentsTurn &&
        !!this.lastStand.hasStarted()
      ) {
        if (this.lastStand.hasEnded()) {
          return "You were too late";
        }
        return `${this.lastStandRemainingSeconds}s left to counter defeat`;
      }
      return "";
    },
    opponentLastStandText() {
      if (
        this.lastStand.hasStarted() &&
        this.lastStandInfo.playerId !== this.ownUser.id
      ) {
        if (this.lastStand.hasEnded()) {
          return "You have won";
        }
        return `Your opponent has ${this.lastStandRemainingSeconds}s left to counter defeat`;
      }
      return "";
    },
    inDiscardPhaseAndMustDiscardCard() {
      return (
        this.phase === PHASES.discard &&
        this.playerCardsOnHand.length > this.maxHandSize
      );
    },
    numberOfStationCardsToSelect() {
      if (!this.attackerCard) return 0;
      if (this.selectedDefendingStationCards.length === 0) return 0;

      return (
        this.attackerCard.attack - this.selectedDefendingStationCards.length
      );
    },
    requirementGuideText() {
      if (this.firstRequirementIsDiscardCard) {
        const cardsToDiscard = this.countInFirstRequirement;
        return `Discard ${cardsToDiscard} ${pluralize("card", cardsToDiscard)}`;
      } else if (
        this.firstRequirementIsDamageStationCard &&
        this.cardsLeftToSelect > 0
      ) {
        return `Select ${this.cardsLeftToSelect} station ${pluralize(
          "card",
          this.cardsLeftToSelect
        )} to damage`;
      } else if (
        this.firstRequirementIsDamageShieldCard &&
        this.cardsLeftToSelect > 0
      ) {
        return `Select ${this.cardsLeftToSelect} shield ${pluralize(
          "card",
          this.cardsLeftToSelect
        )} to damage`;
      } else if (this.firstRequirementIsDrawCard) {
        return this.drawCardOrMillText;
      } else {
        return "";
      }
    },
    shouldShowSkipDrawCard() {
      return (
        this.firstRequirementIsDrawCard &&
        this.firstRequirement.cardCommonId === FatalError.CommonId
      );
    },
    actionGuideText() {
      if (!this.activeAction) return "";
      if (this.activeAction.text) {
        return this.activeAction.text;
      }
      return "";
    },
    textOnWaitPhase() {
      if (this.playerHasControlOfOpponentsTurn) {
        return "Put down any 0-cost card";
      }
      return "Enemy turn";
    },
    turnControlButtonText() {
      if (this.playerHasControlOfOpponentsTurn) {
        return "Release control";
      }
      return "Take control";
    },
    cardStyle() {
      if (this.activeActionCardImageUrl) {
        return {
          backgroundImage: `url(${this.activeActionCardImageUrl})`,
        };
      } else if (this.requirementCardImageUrl) {
        return {
          backgroundImage: `url(${this.requirementCardImageUrl})`,
        };
      } else {
        return {
          display: "none",
        };
      }
    },
    drawCardOrMillText() {
      const count = this.firstRequirementIsDrawCard
        ? this.countInFirstRequirement
        : this.playerRuleService.countCardsLeftToDrawForDrawPhase();
      if (this.canMill) {
        if (count > 1) {
          return `Draw card or Mill opponent (x${count})`;
        }
        return `Draw card or Mill opponent`;
      }
      return `Draw ${count} ${pluralize("card", count)}`;
    },
  },
  watch: {
    lastStandInfo: {
      handler() {
        if (this.lastStandInfo === null) return;

        this.lastStandUpdateIntervalId = setInterval(() => {
          this.lastStandRemainingSeconds = this.lastStand.remainingSeconds();
          if (this.lastStandRemainingSeconds === 0)
            clearInterval(this.lastStandUpdateIntervalId);
        }, 200);
      },
      immediate: true,
    },
  },
  destroyed() {
    if (this.lastStandRemainingSeconds === 0)
      clearInterval(this.lastStandUpdateIntervalId);
  },
  methods: {
    ...mapActions(["toggleControlOfTurn"]),
    showEnlargedCard() {
      this.$emit("showEnlargedCard");
    },
  },
};

function pluralize(word, count) {
  return count === 1 ? word : word + "s";
}
</script>
<style lang="scss">
@import "../../cardVariables";

.guideTextCardWrapper {
  width: $cardWidth * 0.1;
  height: $cardHeight * 0.1;
  position: relative;
  top: 4px;
  margin-right: 15px;
  flex: 0 0 auto;
}
</style>
