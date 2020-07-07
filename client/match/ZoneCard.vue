<template>
  <div
    ref="card"
    v-longpress="cardLongpress"
    :style="cardStyle"
    :data-type="card.type || ''"
    :class="classes"
    :title="title"
  >
    <div :class="['indicatorOverlays', { 'flash-red': flashCard }]">
      <div
        v-if="(card.damage && card.damage > 0)"
        class="card-damageIndicatorWrapper"
      >
        <div class="card-damageIndicator" :style="damageTextStyle">
          <svg
            :style="damageTextIconStyle"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 454.6 454.6"
          >
            <path
              fill="#ff1a1a"
              d="M250.1 139.2C220 46 262.5 0 262.5 0S122.8 67.2 81.3 248.3C64 223.2 48.7 209.5 50.5 214c18.6 48.4-23.6 70-23 121.1.5 51 88.6 109.5 88.6 109.5 3.5 2.5 7.2 4.9 11 7.2-3.3-4-6.3-8-9.2-12-9.5-13.6-16.2-28-16.4-41.9-.3-27.3 11.7-46.2 20-65.4 7.2-16.5 11.7-33.2 3-55.7-1.4-3.6 7.8 4.3 20.3 20 24.4-66 48.3-123.3 48.3-123.3s.7 90 31.1 147.5c28.6 54.1 27 81.9 27 81.9 52-49.7 69.4-128.8 69.4-128.8 18.9 16.7 29.8 37.9 35.9 59.2 12.9 44.8-13.8 89.8-14.4 94.2-.2 1.8-.7 3.5-1 5.2a60.9 60.9 0 0 1-9.7 22c5-3.2 9.5-6.6 14-10.2 0 0 81.2-58.3 81.8-109.4.6-51-41.7-72.7-23-121.1 1.6-4.2-10.7 7.4-25.6 29.5-14.8-45.5-24.2-82.3-73.5-125.7 0 0 9.1 98.8-43.3 170.4 0 0 18.4-56-11.7-149z"
            />
          </svg>
          {{ card.damage }}
        </div>
      </div>
      <div v-if="attackBoost" :class="['card-attackBoostIndicatorWrapper']">
        <div class="card-attackBoostIndicator" :style="damageTextStyle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            :style="damageTextIconStyle"
            viewBox="0 0 47 47"
          >
            <path
              fill="#ff1a1a"
              d="M34.66 22.38l-.26.27a19.37 19.37 0 0 1-3.49 2.76c1.61 2.37 2.81 4.8 3.49 7.16 1.02 3.56.68 6.52-.92 8.12-1 1-2.46 1.5-4.34 1.5-4.78 0-10.93-3.17-16.04-8.29-8.01-8-10.01-17.17-6.8-20.39 1-1 2.46-1.5 4.34-1.5 3.26 0 7.17 1.49 10.95 4.06a19.52 19.52 0 0 1 2.76-3.47l.27-.27C19.95 9.06 15 7.21 10.64 7.21c-3.16 0-5.83 1-7.74 2.9C-2.8 15.84.17 27.78 9.7 37.3c6.07 6.07 13.34 9.7 19.44 9.7 3.16 0 5.83-1 7.74-2.9 2.91-2.92 3.67-7.48 2.14-12.85a30.41 30.41 0 0 0-4.36-8.88z"
            />
            <path
              fill="#ff1a1a"
              d="M14.7 15.65a4.5 4.5 0 0 0-3.3 1.26c-.9.9-2.13 3-.37 7 1 2.28 2.8 4.77 5.04 7.02 3.66 3.66 7.77 5.93 10.72 5.93a4.5 4.5 0 0 0 3.3-1.26c.89-.9 2.13-3 .36-7.01-.32-.73-.73-1.48-1.2-2.24-3.6 1.78-6.62 1.94-6.8 1.95a3.62 3.62 0 0 1-3.76-3.75c.01-.19.17-3.2 1.95-6.79-2.16-1.34-4.25-2.11-5.95-2.11z"
            />
            <path
              fill="#ff1a1a"
              d="M46.96 7.7c-.1-.4-.4-.72-.8-.85l-4.58-1.43L40.14.84a1.2 1.2 0 0 0-2-.49l-4.16 4.17c-.28.28-.4.69-.33 1.08l.51 2.62c-2.43 1.17-5.5 3.46-8.12 6.07a16.87 16.87 0 0 0-4.95 10.36 1.2 1.2 0 0 0 1.26 1.25c.23-.01 5.7-.3 10.35-4.95 2.6-2.62 4.9-5.7 6.08-8.12l2.61.51c.4.08.8-.04 1.08-.33l4.17-4.17c.3-.3.42-.72.32-1.13z"
            />
          </svg>
          {{ attackBoost }}
        </div>
      </div>
    </div>
    <div v-if="disabled" class="cardDisabledOverlay">
      <span class="cardDisabledOverlay-text" :style="disabledOverlayTextStyle">
        X
      </span>
    </div>
    <div class="actionOverlays">
      <div
        v-if="canBeSelectedAsDefender"
        class="attackable actionOverlay actionOverlay--turnedAround"
        @click="readyToDefenseClick(card)"
      >
        <div
          v-if="predictedResultsIfAttacked.defenderParalyzed"
          class="attackble-paralyzed actionOverlay-predictionText"
        >
          Paralyze
        </div>
        <div
          v-else-if="predictedResultsIfAttacked.defenderDestroyed"
          class="actionOverlay-predictedLethal actionOverlay-predictionText"
        >
          {{ behaviourCard.defense - behaviourCard.damage }}
          ⇒ 0
        </div>
        <div
          v-else
          class="actionOverlay-predictedDamageChange actionOverlay-predictionText"
        >
          {{ behaviourCard.defense - behaviourCard.damage }}
          ⇒
          {{
            behaviourCard.defense - predictedResultsIfAttacked.defenderDamage
          }}
        </div>
      </div>
      <div
        v-else-if="canBeSelectedForRepair"
        class="selectForRepair actionOverlay"
        @click="selectForRepair(card.id)"
      >
        <div
          v-if="behaviourCard.paralyzed != predictedResultsIfRepaired.paralyzed"
          class="selectForRepair-reActivate actionOverlay-predictionText"
        >
          Re-activate
        </div>
        <div
          v-if="behaviourCard.damage != predictedResultsIfRepaired.damage"
          class="actionOverlay-predictedDamageChange actionOverlay-predictionText"
        >
          {{ behaviourCard.defense - behaviourCard.damage }}
          ⇒
          {{ behaviourCard.defense - predictedResultsIfRepaired.damage }}
        </div>
      </div>
      <template v-else-if="canSelectAction">
        <div
          v-if="canMove"
          class="movable actionOverlay"
          @click.stop="moveClick"
        >
          Move
        </div>
        <div
          v-if="canAttack"
          class="readyToAttack actionOverlay"
          @click.stop="readyToAttackClick"
        >
          Attack
        </div>
        <div
          v-if="canRepair"
          class="repair actionOverlay"
          @click="selectAsRepairer(card.id)"
        >
          Repair
        </div>
        <div
          v-if="canBeSacrificed"
          class="sacrifice actionOverlay"
          @click="sacrifice(card.id)"
        >
          Sacrifice
        </div>
        <div
          v-if="canTriggerDormantEffect"
          class="triggerDormantEffect actionOverlay"
          @click="triggerDormantEffect(card.id)"
        >
          <span v-if="card.commonId === '34'">
            Use to counter
          </span>
          <span v-else>
            Use
          </span>
        </div>
        <div
          v-if="canBeDiscarded"
          class="discard actionOverlay"
          @click="discardClick"
        >
          Discard
        </div>
      </template>
      <div
        v-if="canSelectCardForAction"
        :class="['selectable', { 'selectable--turnedAround': !isPlayerCard }]"
        @click="selectCardForActiveAction(card.id)"
      >
        <template v-if="predictedResultsIfTargetForAction">
          <div
            v-if="predictedResultsIfTargetForAction.destroyed"
            class="actionOverlay-predictedLethal actionOverlay-predictionText"
          >
            {{ behaviourCard.defense - behaviourCard.damage }}
            ⇒ 0
          </div>
          <div
            v-else
            class="actionOverlay-predictedDamageChange actionOverlay-predictionText"
          >
            {{ behaviourCard.defense - behaviourCard.damage }}
            ⇒
            {{
              behaviourCard.defense -
              predictedResultsIfTargetForSacrifice.damage
            }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
const Vuex = require("vuex");
const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers(
  "match"
);
const { mapGetters: mapRequirementGetters } = Vuex.createNamespacedHelpers(
  "requirement"
);
const {
  mapState: mapCardState,
  mapGetters: mapCardGetters,
  mapActions: mapCardActions,
} = Vuex.createNamespacedHelpers("card");
const { mapGetters: mapPermissionGetters } = Vuex.createNamespacedHelpers(
  "permission"
);
const expandedCardHelpers = Vuex.createNamespacedHelpers("expandedCard");
const vClickOutside = require("v-click-outside");
const longpress = require("../utils/longpress.js");
const getCardImageUrl = require("../utils/getCardImageUrl.js");
const PlayerCardInPlay = require("./card/PlayerCardInPlay.js");

const DAMAGE_WHEN_TARGET_FOR_SACRIFICE = 4;

module.exports = {
  props: ["card", "zonePlayerRow", "zoneOpponentRow", "ownerId", "isHomeZone"],
  data() {
    return {
      cardWidth: 0,
    };
  },
  computed: {
    ...mapState([
      "phase",
      "turn",
      "events",
      "attackerCardId",
      "ownUser",
      "repairerCardId",
      "flashAttackedCardId",
      "highlightCardIds",
    ]),
    ...mapGetters([
      "allOpponentStationCards",
      "createCard",
      "attackerCard",
      "repairerCard",
      "canThePlayer",
    ]),
    ...mapGetters({
      remotePlayerStateService: "opponentStateService",
      localPlayerStateService: "playerStateService",
    }),
    ...mapPermissionGetters([
      "canSelectCardsForActiveAction",
      "canDiscardActivateDurationCards",
      "canSelectShieldCardsForRequirement",
    ]),
    ...mapCardState([
      "transientPlayerCardsInHomeZone",
      "activeAction",
      "activeActionCardData",
      "selectedCardIdsForAction",
      "checkIfCanBeSelectedForAction",
    ]),
    ...mapCardGetters(["activeActionCard"]),
    ...mapRequirementGetters(["attackerRequirement"]),
    behaviourCard() {
      return this.createCard(this.card, { playerId: this.ownerId });
    },
    title() {
      let title = `${this.card.name}\n`;
      if (this.card.damage) {
        title += `Damage: ${this.card.damage}\n`;
      }
      if (this.attackBoost) {
        title += `Attack boost: ${this.attackBoost}\n`;
      }

      if (title.length === 0) {
        return "Long press over any card to expand it";
      } else {
        return title + "\nLong press over any card to expand it";
      }
    },
    flashCard() {
      return this.flashAttackedCardId === this.card.id;
    },
    classes() {
      const classes = ["card", "card--expandable"];
      if (this.selectedAsAttacker) {
        classes.push("selectedAsAttacker");
      }
      if (this.isActiveActionCard) {
        classes.push("isActiveActionCard");
      }
      if (this.isRepairing) {
        classes.push("isRepairing");
      }
      if (this.card.paralyzed) {
        classes.push("paralyzed");
      }
      if (this.flashCard) {
        classes.push(this.isPlayerCard ? "shake" : "shake--upsideDown");
      }
      if (this.highlightCardIds.includes(this.card.id)) {
        classes.push("flash");
      }
      if (!this.isPlayerCard) {
        classes.push("card--upsideDown");
      }
      return classes;
    },
    disabled() {
      return !this.behaviourCard.canBeUsed(this.card);
    },
    cardStyle() {
      const cardUrl = getCardImageUrl.byCommonId(this.card.commonId);
      return {
        backgroundImage: `url("${cardUrl}")`,
      };
    },
    damageTextIconStyle() {
      const fontSize = Math.round(this.cardWidth * 0.25);
      return {
        width: fontSize + "px",
      };
    },
    damageTextStyle() {
      const fontSize = Math.round(this.cardWidth * 0.25);
      return {
        fontSize: fontSize + "px",
      };
    },
    disabledOverlayTextStyle() {
      const fontSize = Math.round(this.cardWidth * 1.55);
      return {
        fontSize: fontSize + "px",
      };
    },
    isPlayerCard() {
      return this.ownerId === this.ownUser.id;
    },
    opponentStateService() {
      return this.isPlayerCard
        ? this.remotePlayerStateService
        : this.localPlayerStateService;
    },
    playerCardInPlay() {
      return PlayerCardInPlay({
        card: this.behaviourCard,
        attackerSelected: !!this.attackerCardId,
        canThePlayer: this.canThePlayer,
        opponentStateService: this.opponentStateService,
      });
    },
    selectedAsAttacker() {
      return this.attackerCardId === this.card.id;
    },
    isActiveActionCard() {
      return (
        this.activeActionCardData &&
        this.activeActionCardData.id === this.card.id
      );
    },
    canSelectAction() {
      if (!this.isPlayerCard) return false;
      if (this.isTransient) return false;

      return !this.attackerCardId && !this.repairerCardId && !this.activeAction;
    },
    canMove() {
      return this.playerCardInPlay.canMove();
    },
    canAttack() {
      return this.playerCardInPlay.canAttack();
    },
    canBeSacrificed() {
      return this.playerCardInPlay.canBeSacrificed();
    },
    canTriggerDormantEffect() {
      return this.canThePlayer.triggerCardsDormantEffect(this.behaviourCard);
    },
    canBeSelectedAsDefender() {
      const card = this.createCard(this.card, {
        isOpponent: !this.isPlayerCard,
      });
      if (
        this.canSelectShieldCardsForRequirement &&
        !this.isPlayerCard &&
        card.stopsStationAttack()
      ) {
        return true;
      } else {
        return (
          !this.isPlayerCard &&
          this.attackerCardId &&
          this.attackerCard.canAttackCard(card)
        );
      }
    },
    canBeDiscarded() {
      if (this.card.type !== "duration") return false;
      return this.canDiscardActivateDurationCards;
    },
    canRepair() {
      return this.playerCardInPlay.canRepair();
    },
    canBeSelectedForRepair() {
      if (!this.isPlayerCard) return false;
      if (!this.repairerCardId) return false;

      return this.repairerCard.canRepairCard(this.behaviourCard);
    },
    isSelectedForAction() {
      return this.selectedCardIdsForAction.includes(this.card.id);
    },
    isRepairing() {
      return this.card.id === this.repairerCardId;
    },
    isTransient() {
      return this.transientPlayerCardsInHomeZone.some(
        (c) => c.id === this.card.id
      );
    },
    canSelectCardForAction() {
      if (this.isTransient) return false;
      if (this.isPlayerCard) return false;
      if (this.isSelectedForAction) return false;
      if (!this.canSelectCardsForActiveAction) return false;

      const options = {
        cardData: this.card,
        isStationCard: false,
        isOpponentCard: !this.isPlayerCard,
      };
      return this.checkIfCanBeSelectedForAction(options);
    },
    predictedResultsIfAttacked() {
      if (this.canSelectShieldCardsForRequirement) {
        return this.createCard({
          commonId: this.attackerRequirement,
        }).simulateAttackingCard(this.behaviourCard);
      } else {
        if (!this.attackerCardId) return null;

        return this.attackerCard.simulateAttackingCard(this.behaviourCard);
      }
    },
    predictedResultsIfRepaired() {
      if (!this.repairerCardId) return null;

      return this.repairerCard.simulateRepairingCard(this.behaviourCard);
    },
    predictedResultsIfTargetForAction() {
      if (!this.activeAction) return null;

      if (this.activeAction.name === "sacrifice") {
        return this.predictedResultsIfTargetForSacrifice;
      } else if (this.activeAction.name === "destroyAnyCard") {
        return this.predictedResultsIfTargetForDestroyAnyCard;
      } else {
        return null;
      }
    },
    predictedResultsIfTargetForSacrifice() {
      const defense = this.behaviourCard.defense;
      const damageAfter =
        this.behaviourCard.damage + DAMAGE_WHEN_TARGET_FOR_SACRIFICE;
      return {
        damage: damageAfter,
        destroyed: defense - damageAfter <= 0,
      };
    },
    predictedResultsIfTargetForDestroyAnyCard() {
      return {
        damage: this.behaviourCard.defense,
        destroyed: true,
      };
    },
    attackBoost() {
      return this.behaviourCard.attackBoost;
    },
  },
  methods: {
    ...mapActions([
      "selectAsAttacker",
      "selectAsDefender",
      "moveCard",
      "discardDurationCard",
      "selectAsRepairer",
      "selectForRepair",
    ]),
    ...mapCardActions([
      "startSacrifice",
      "selectCardForActiveAction",
      "triggerDormantEffect",
    ]),
    ...expandedCardHelpers.mapActions(["expandCard"]),
    moveClick() {
      this.moveCard(this.card);
    },
    readyToAttackClick() {
      this.selectAsAttacker(this.card);
    },
    readyToDefenseClick() {
      if (
        this.canSelectShieldCardsForRequirement &&
        this.createCard(this.card).stopsStationAttack()
      ) {
        this.selectAsDefender({
          card: this.card,
          fromRequirement: "damageShieldCard",
        });
      } else {
        this.selectAsDefender({ card: this.card });
      }
    },
    discardClick() {
      this.discardDurationCard(this.card);
    },
    sacrifice() {
      this.startSacrifice(this.card.id);
    },
    cardLongpress() {
      this.expandCard(this.card);
    },
  },
  mounted() {
    if (!this.$refs.card) {
      throw Error(
        `Failed to render ZoneCard component with card data: ${JSON.stringify(
          this.card
        )}`
      );
    } else {
      this.cardWidth = this.$refs.card.offsetWidth;
    }
  },
  directives: {
    clickOutside: vClickOutside.directive,
    longpress,
  },
};
</script>
<style scoped lang="scss">
@import "miscVariables";

.card {
  position: relative;
  flex: 0 0 auto;
}

.actionOverlays,
.indicatorOverlays {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.actionOverlays {
  z-index: 2;
}

.indicatorOverlays {
  z-index: 1;
}

.actionOverlay {
  color: white;
  font-family: Helvetica, sans-serif;
  font-size: 16px;
  flex: 1 1;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0.5;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &--turnedAround {
    transform: rotate(180deg);
  }
}

.movable,
.repair {
  background-color: rgba(0, 0, 0, 0.5);
}

.discard {
  background-color: rgba(0, 1, 51, 0.5);
}

.readyToAttack,
.attackable,
.sacrifice {
  background-color: rgba(255, 100, 100, 0.5);
}

.attackable {
  cursor: crosshair;
}

.selectForRepair,
.triggerDormantEffect {
  background-color: rgba(100, 100, 255, 0.5);
}

.selectedAsAttacker,
.isActiveActionCard {
  outline: 2px solid red;
}

.isRepairing {
  outline: 2px solid rgba(100, 100, 255, 1);
}

.actionOverlay-predictionText {
  font-family: "Space mono", monospace;
}

.actionOverlay-predictedDamageChange {
  font-size: 1.5em;
}

.actionOverlay-predictedLethal {
  font-size: 1.5em;
}

.attackble-paralyzed {
  font-size: 1em;
}

.selectForRepair-repairDamage {
  font-size: 1.5em;
}

.selectForRepair-reActivate {
  font-size: 1em;
}

.paralyzed {
  transition: transform 0.1s cubic-bezier(0, 0.07, 0.12, 1.04) !important;
  margin-right: 4% !important;
  margin-left: 4% !important;
  transform: rotate(90deg) !important;
  flex: 0 0 auto;

  .field-opponentZoneRows &:first-child {
    margin-right: 4px !important;
  }

  .field-playerZoneRows &:first-child {
    margin-left: 4px !important;
  }

  .field-opponentZoneRows &:last-child {
    margin-left: 4px !important;
  }

  .field-playerZoneRows &:last-child {
    margin-right: 4px !important;
  }
}

.actionOverlays:hover {
  & .movable,
  & .readyToAttack,
  & .attackable,
  & .discard,
  & .repair,
  & .selectForRepair {
    visibility: visible;
  }
}

@keyframes fullOpacityOnIntentionalHover {
  0% {
    opacity: 0;
  }

  99% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
