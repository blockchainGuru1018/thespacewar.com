<template>
  <div
    :class="[
      'stationCardWrapper',
      {
        'stationCardWrapper--fullSize':
          stationCard.flipped && !isOpponentStationCard,
      },
    ]"
    :title="cardTittle"
  >
    <div
      v-longpress="cardLongpress"
      :class="classes"
      :style="cardStyle"
      @mousedown.right="cardLongpress"
      @contextmenu.prevent="(e) => e.preventDefault()"
    >
      <!--      TODO: get better css here-->
      <div v-if="!isHoldingCard" class="actionOverlays">
        <portal-target :name="`stationCard-actionOverlays--${stationRow}Row`" />
        <div
          v-if="
            stationCard.flipped &&
              !isOpponentStationCard &&
              createCard(stationCard.card).costInflation !== 0
          "
          :class="['card-attackBoostIndicatorWrapper']"
        >
          <div
            v-if="!canBeSelectedForRepair"
            class="card-stationCostInflationWrapper"
          >
            +{{ createCard(stationCard.card).costInflation }}
          </div>
        </div>
        <div
          v-if="canPlayCard && !canBeSelectedForRepair"
          class="movable moveToZone"
          @click.stop="
            putDownCardOrShowChoiceOrAction({
              location: 'zone',
              cardData: stationCard.card,
            })
          "
        >
          Play card
        </div>

        <div
          v-if="canMoveCardToOtherStationRow"
          class="movable moveToOtherStationRow"
          @click.stop="startMovingStationCard({ stationCard })"
        >
          Move
        </div>

        <div
          v-if="canBeSelectedAsDefender"
          class="attackable"
          @click.stop="selectStationCardAsDefender(stationCard)"
        />
        <div
          v-else-if="canBeSelectedForRepair"
          class="selectForRepair actionOverlay"
          @click.stop="selectForRepair(stationCard.id)"
        />
        <div
          v-else-if="canBeSelectedForRequirement"
          class="selectable"
          @click.stop="selectStationCardForRequirement(stationCard)"
        />
        <div
          v-else-if="canSelectCardForAction"
          class="selectable"
          @click.stop="selectCardForActiveAction(stationCard.id)"
        />
      </div>
    </div>
  </div>
</template>
<script>
const Vuex = require("vuex");
const getCardImageUrl = require("../../utils/getCardImageUrl.js");
const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers(
  "match"
);
const { mapGetters: mapPermissionGetters } = Vuex.createNamespacedHelpers(
  "permission"
);
const {
  mapState: mapRequirementState,
  mapActions: mapRequirementActions,
} = Vuex.createNamespacedHelpers("requirement");
const {
  mapState: mapCardState,
  mapActions: mapCardActions,
} = Vuex.createNamespacedHelpers("card");
const expandedCardHelpers = Vuex.createNamespacedHelpers("expandedCard");
const longpress = require("../../utils/longpress.js");

module.exports = {
  props: [
    "stationCard",
    "isOpponentStationCard",
    "isHoldingCard",
    "stationRow",
  ],
  computed: {
    ...mapState([
      "opponentCardsInZone",
      "attackerCardId",
      "phase",
      "selectedDefendingStationCards",
      "repairerCardId",
      "repairerCommander",
    ]),
    ...mapRequirementState(["selectedStationCardIdsForRequirement"]),
    ...mapGetters([
      "attackerCanAttackStationCards",
      "actionPoints2",
      "createCard",
      "moveStationCard",
    ]),
    ...mapPermissionGetters([
      "canSelectStationCards",
      "canPutDownStationCardInHomeZone",
      "canSelectCardsForActiveAction",
    ]),
    ...mapCardState([
      "checkIfCanBeSelectedForAction",
      "selectedCardIdsForAction",
    ]),
    cardId() {
      return this.stationCard.id;
    },
    classes() {
      const classes = ["stationCard", "card"];
      if (this.selectedWithDanger) {
        classes.push("selected--danger");
      }
      if (this.selectedAsDefender) {
        classes.push("selectedAsDefender");
      }
      if (this.canBeSelectedAsDefender) {
        classes.push("possibleTargetBorder");
      }
      if (this.stationCard.flipped) {
        classes.push("stationCard--flipped", "card--expandable");
      } else {
        classes.push("card-faceDown");
      }

      return classes;
    },
    cardTittle() {
      if (this.stationCard.flipped) {
        return "Right click or long press over any card to expand it";
      }
      if (this.stationCard.place === "draw") {
        return "In your draw phase, draw 1 card for each card in this station row.";
      }
      if (this.stationCard.place === "action") {
        return "In your action phase, receive 2 actions for each card in this station row.";
      }
      if (this.stationCard.place === "handSize") {
        return "In your discard phase, keep 3 cards for each card in this station row.";
      }
      return "";
    },
    cardStyle() {
      if (this.stationCard.flipped) {
        const cardUrl = getCardImageUrl.byCommonId(
          this.stationCard.card.commonId
        );
        return {
          backgroundImage: `url(${cardUrl})`,
        };
      }
      return {};
    },
    canPlayCard() {
      return (
        !this.isOpponentStationCard &&
        this.stationCard.flipped &&
        this.actionPoints2 >= this.behaviourCardInStationCard.costToPlay &&
        this.canPutDownStationCardInHomeZone &&
        this.behaviourCardInStationCard.canBePlayed()
      );
    },
    behaviourCardInStationCard() {
      return this.createCard(this.stationCard.card);
    },
    canMoveCardToOtherStationRow() {
      if (this.isOpponentStationCard) return false;

      return this.moveStationCard.canMove({
        cardId: this.cardId,
        location: `station-${this.stationCard.place}`,
      });
    },
    selectedWithDanger() {
      return (
        this.selectedAsDefender ||
        this.selectedForRequirement ||
        this.selectedForAction
      );
    },
    selectedAsDefender() {
      return this.selectedDefendingStationCards.includes(this.stationCard.id);
    },
    canBeSelectedAsDefender() {
      return (
        !this.selectedAsDefender &&
        !this.stationCard.flipped &&
        this.isOpponentStationCard &&
        this.attackerCardId &&
        this.attackerCanAttackStationCards &&
        !this.opponentCardsInZone.some((c) =>
          this.createCard(c).stopsStationAttack()
        )
      );
    },
    canBeSelectedForRepair() {
      if (!this.stationCard.card) return false;
      if (!this.repairerCardId && !this.repairerCommander) return false;

      return this.createCard(this.stationCard.card).canBeRepaired();
    },
    selectedForRequirement() {
      return this.selectedStationCardIdsForRequirement.includes(
        this.stationCard.id
      );
    },
    canBeSelectedForRequirement() {
      return (
        this.isOpponentStationCard &&
        !this.stationCard.flipped &&
        this.canSelectStationCards &&
        !this.selectedForRequirement
      );
    },
    selectedForAction() {
      return this.selectedCardIdsForAction.includes(this.stationCard.id);
    },
    canSelectCardForAction() {
      if (!this.canSelectCardsForActiveAction) return false;
      if (this.selectedForAction) return false;

      const options = {
        cardData: this.stationCard,
        isStationCard: true,
        isOpponentCard: this.isOpponentStationCard,
      };
      return this.checkIfCanBeSelectedForAction(options);
    },
  },
  methods: {
    ...mapActions(["selectStationCardAsDefender", "selectForRepair"]),
    ...mapRequirementActions(["selectStationCardForRequirement"]),
    ...mapCardActions([
      "selectCardForActiveAction",
      "putDownCardOrShowChoiceOrAction",
      "startMovingStationCard",
    ]),
    ...expandedCardHelpers.mapActions(["expandCard"]),
    cardLongpress() {
      if (this.stationCard.flipped) {
        this.expandCard(this.stationCard.card);
      }
    },
  },
  directives: {
    longpress,
  },
};
</script>
<style lang="scss">
.possibleTargetBorder {
  border: 2px solid #2ee62e;
  border-radius: 7px;
}
.card {
  position: relative;
}
</style>
