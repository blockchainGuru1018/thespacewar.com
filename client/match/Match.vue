<template>
  <div ref="match-wrapper" :class="['match-wrapper', { shake: shake }]">
    <div class="match-overlay" />
    <div
      :class="
        bg === 'background_new'
          ? 'match-backgroundWrapper animated'
          : 'match-backgroundWrapper'
      "
    >
      <!--            <ParticlesJS></ParticlesJS>-->
      <div v-show="bg === 'background_new'" class="grid-bg" />

      <div v-show="bg === 'background_new'" class="match-backgroundOverlay" />
      <img
        v-show="bg === 'background_old'"
        class="match-background"
        src="https://images.thespacewar.com/game-background.jpg"
      />
    </div>
    <div
      ref="match"
      :class="[
        'match perspectiveParentCenter',
        `currentPhase--${phase}`,
        {
          'match-selectingStartingStationCards': selectingStartingStationCards,
        },
      ]"
    >
      <div
        :class="[
          'field-dividerWrapper',
          {
            'field-dividerWrapper--placeholder': activateEventCardGhostVisible,
          },
        ]"
      >
        <div class="field-divider" />
        <portal-target
          class="field-dividerContent"
          name="player-top"
          tag="div"
        />
      </div>
      <div class="field perspectiveChild">
        <div class="field-opponent" style="--aspect-ratio: (16/9) * 2;">
          <div><!-- NEEDED TO KEEP ASPECT-RATIO--></div>
          <div
            ref="opponentStationCardsContainer"
            :style="opponentStationStyle"
            class="field-opponentStation opponentStationCards field-station field-section"
          >
            <div class="field-stationRow">
              <station-card
                v-for="card in opponentStation.drawCards"
                :key="card.id"
                :is-holding-card="!!holdingCard"
                :is-opponent-station-card="true"
                :station-card="card"
              />
              <StationCardWrapper :transparent="true" />
            </div>
            <div class="field-stationRow">
              <station-card
                v-for="card in opponentStation.actionCards"
                :key="card.id"
                :is-holding-card="!!holdingCard"
                :is-opponent-station-card="true"
                :station-card="card"
              />
              <StationCardWrapper :transparent="true" />
            </div>
            <div class="field-stationRow opponentStation-handSizeRow">
              <station-card
                v-for="card in opponentStation.handSizeCards"
                :key="card.id"
                :is-holding-card="!!holdingCard"
                :is-opponent-station-card="true"
                :station-card="card"
              />
              <StationCardWrapper :transparent="true" />
            </div>
          </div>
          <div class="field-zoneRows field-opponentZoneRows">
            <div
              class="opponentCardsInZone field-opponentZoneRow field-zone field-section"
            >
              >
              <template v-for="n in opponentCardsInZone.length">
                <zone-card
                  v-if="n <= opponentCardsInZone.length"
                  :key="sortedOpponentCardsInZone[n - 1].id"
                  :card="sortedOpponentCardsInZone[n - 1]"
                  :class="[
                    'card--turnedAround',
                    {
                      'card-lastDurationCard':
                        lastSortedOpponentDurationCardIndex === n - 1,
                    },
                  ]"
                  :owner-id="opponentUser.id"
                  :zone-opponent-row="playerCardsInOpponentZone"
                  :zone-player-row="opponentCardsInZone"
                />
              </template>
              <div
                v-if="opponentCardsInZone.length === 0"
                class="card card-placeholder"
              />
            </div>
            <div
              class="playerCardsInOpponentZone field-opponentZoneRow field-zone field-section"
            >
              <template v-for="n in playerCardsInOpponentZone.length">
                <zone-card
                  v-if="n <= playerCardsInOpponentZone.length"
                  :key="playerCardsInOpponentZone[n - 1].id"
                  :card="playerCardsInOpponentZone[n - 1]"
                  :owner-id="ownUser.id"
                  :zone-opponent-row="opponentCardsInZone"
                  :zone-player-row="playerCardsInOpponentZone"
                />
              </template>
              <div
                v-if="playerCardsInOpponentZone.length === 0"
                class="card card-placeholder"
              />
            </div>
          </div>
          <div class="field-piles field-section">
            <div
              :class="[
                'field-discardPile',
                { flash: flashOpponentDiscardPile },
              ]"
            >
              <div
                v-if="!opponentTopDiscardCard"
                class="card card-placeholder"
              />
              <div
                v-else
                v-longpress="() => expandCard(opponentTopDiscardCard)"
                :data-cardId="opponentTopDiscardCard.id"
                :style="getCardImageStyle(opponentTopDiscardCard)"
                class="card card--turnedAround card--expandable"
                @mousedown.right="() => expandCard(opponentTopDiscardCard)"
                @contextmenu.prevent="(e) => e.preventDefault()"
              />
            </div>

            <div class="field-commandersAndDrawPile">
              <OpponentCommanderCards />
              <div class="field-drawPile">
                <portal-target name="opponentDrawPile" />
                <div
                  v-if="!opponentDeckIsEmpty"
                  class="card card-faceDown pile-3d"
                  :style="
                    'transform: translateZ(calc(1px * ' +
                      opponentCardPileHeight +
                      '))'
                  "
                >
                  <div
                    class="actionOverlays"
                    :style="
                      'transform: translateZ(calc(1px * ' +
                      opponentCardPileHeight +
                        '))'
                    "
                  >
                    <div
                      v-if="canMill"
                      class="drawPile-discardTopTwo actionOverlay"
                      @click="opponentDrawPileClick"
                    >
                      Mill {{ millCardCount }}
                    </div>
                  </div>
                </div>
                <div v-else-if="canMill" class="card card-emptyDeck">
                  <div class="actionOverlays">
                    <div
                      class="drawPile-discardTopTwo actionOverlay"
                      @click="opponentDrawPileClick"
                    >
                      Mill {{ millCardCount }}
                    </div>
                  </div>
                </div>
                <div v-else class="card card-emptyDeck" />
                <div
                  v-for="i in opponentCardPileHeight"
                  :key="i"
                  :class="'opponent-card-height h-' + i"
                ></div>
                <div
                  class="drawPile-cardCount drawPile-cardCountText"
                  :style="
                    'transform: translateZ(calc(1px * ' +
                    opponentCardPileHeight +
                    '))'
                  "
                >
                  {{ opponentCardsInDeckCount }}
                </div>
              </div>
            </div>
          </div>
          <OpponentPreGameOverlay />
        </div>
        <div class="field-player" style="--aspect-ratio: (16/9) * 2;">
          <div><!-- NEEDED TO KEEP ASPECT-RATIO--></div>
          <div class="field-piles field-section">
            <div class="field-commandersAndDrawPile">
              <PlayerCommanderCards class="" />

              <div class="field-drawPile">
                <portal-target name="playerDrawPile" />
                <div
                  v-if="playerCardsInDeckCount > 0"
                  class="card card-faceDown pile-3d"
                  :style="
                    'transform: translateZ(calc(1px * ' +
                    playerCardPileHeight +
                    '))'
                  "
                >
                  <div class="actionOverlays">
                    <div
                      v-if="canDrawCards"
                      class="drawPile-draw actionOverlay"
                      @click="playerDrawPileClick"
                    >
                      Draw
                    </div>
                  </div>
                </div>
                <div v-else-if="canPassDrawPhase" class="card card-emptyDeck">
                  <div class="actionOverlays">
                    <div
                      class="drawPile-draw actionOverlay actionOverlay--hinted"
                      @click="passDrawPhase"
                    >
                      Pass
                    </div>
                  </div>
                </div>
                <div v-else class="card card-emptyDeck" />
                <div
                  class="drawPile-cardCount drawPile-cardCountText"
                  :style="
                    'transform: translateZ(calc(1px * ' +
                    playerCardPileHeight +
                    '))'
                  "
                >
                  {{ playerCardsInDeckCount }}
                </div>
                <div
                  v-for="i in playerCardPileHeight"
                  :key="i"
                  :class="'card-height h-' + i"
                ></div>
              </div>
            </div>

            <div
              :class="[
                'field-discardPile',
                'field-discardPile-player',
                { flash: flashDiscardPile },
              ]"
            >
              <div
                v-if="!playerTopDiscardCard"
                class="card card-placeholder card-emptyDeck"
              />
              <div
                v-else
                v-longpress="() => expandCard(playerTopDiscardCard)"
                :data-cardId="playerTopDiscardCard.id"
                :style="getCardImageStyle(playerTopDiscardCard)"
                class="card card--expandable"
                @mousedown.right="() => expandCard(opponentTopDiscardCard)"
                @contextmenu.prevent="(e) => e.preventDefault()"
              />
              <CardGhost
                v-if="discardPileCardGhostVisible"
                class="discardPile-cardGhost"
                location="discard"
                :element-hovered-over="elementHoveredOver"
                @click="cardGhostClick"
              >
                <div v-if="canReplaceCards" class="replace">
                  Replace
                </div>
                <div v-else class="discard">
                  Discard
                </div>
              </CardGhost>
            </div>
          </div>
          <div class="field-zoneRows field-playerZoneRows">
            <div class="opponentCardsInPlayerZone field-zone field-section">
              <template v-for="n in opponentCardsInPlayerZone.length">
                <zone-card
                  v-if="n <= opponentCardsInPlayerZone.length"
                  :key="opponentCardsInPlayerZone[n - 1].id"
                  :card="opponentCardsInPlayerZone[n - 1]"
                  :owner-id="opponentUser.id"
                  :zone-opponent-row="playerCardsInZone"
                  :zone-player-row="opponentCardsInPlayerZone"
                  class="card--turnedAround"
                />
              </template>
              <div
                v-if="opponentCardsInPlayerZone.length === 0"
                class="card card-placeholder"
              />
            </div>

            <div
              class="playerCardsInZone field-playerZoneCards field-zone field-section"
            >
              <template v-for="n in visiblePlayerCards.length">
                <zone-card
                  v-if="n <= visiblePlayerCards.length"
                  :key="visiblePlayerCards[n - 1].id"
                  :card="(visiblePlayerCards[n - 1])"
                  :class="{
                    'card-lastDurationCard':
                      lastVisiblePlayerDurationCardIndex === n - 1,
                  }"
                  :is-home-zone="true"
                  :owner-id="ownUser.id"
                  :zone-opponent-row="opponentCardsInPlayerZone"
                  :zone-player-row="visiblePlayerCards"
                />
              </template>
              <CardGhost
                v-if="playerZoneCardGhostVisible"
                :element-hovered-over="elementHoveredOver"
                :class="playerZoneCardGhostClasses"
                location="zone"
                @click="homeZoneCardGhostClick"
              >
                <div class="playCard">
                  {{ playerZoneCardGhostText }}
                </div>
              </CardGhost>
            </div>
          </div>
          <div
            ref="playerStationCardsContainer"
            class="playerStationCards field-playerStation field-station field-section"
          >
            <div class="stationCardLabel">
              <div class="stationCardLabelText">
                Station cards
              </div>
            </div>
            <div class="field-stationRow playerStation-drawRow">
              <portal-target name="stationDrawRow" />
              <station-card
                v-for="card in playerVisibleDrawStationCards"
                :key="card.id"
                :is-holding-card="!!holdingCard"
                :station-card="card"
                station-row="draw"
              />
              <StationCardWrapper :transparent="!drawStationCardGhostVisible">
                <CardGhost
                  v-if="drawStationCardGhostVisible"
                  location="station-draw"
                  :element-hovered-over="elementHoveredOver"
                  @click="cardGhostClick"
                />
              </StationCardWrapper>
            </div>
            <div class="field-stationRow playerStation-actionRow">
              <portal-target name="stationActionRow" />
              <station-card
                v-for="card in playerVisibleActionStationCards"
                :key="card.id"
                :is-holding-card="!!holdingCard"
                :station-card="card"
                station-row="action"
              />
              <StationCardWrapper :transparent="!actionStationCardGhostVisible">
                <CardGhost
                  v-if="actionStationCardGhostVisible"
                  :element-hovered-over="elementHoveredOver"
                  location="station-action"
                  @click="cardGhostClick"
                />
              </StationCardWrapper>
            </div>
            <div class="field-stationRow playerStation-handSizeRow">
              <portal-target name="stationHandSizeRow" />
              <station-card
                v-for="card in playerVisibleHandSizeStationCards"
                :key="card.id"
                :is-holding-card="!!holdingCard"
                :station-card="card"
                station-row="handSize"
              />
              <StationCardWrapper
                :transparent="!handSizeStationCardGhostVisible"
              >
                <CardGhost
                  v-if="handSizeStationCardGhostVisible"
                  location="station-handSize"
                  :element-hovered-over="elementHoveredOver"
                  @click="cardGhostClick"
                />
              </StationCardWrapper>
            </div>
          </div>
        </div>

        <EventGhost
          v-if="activateEventCardGhostVisible"
          :element-hovered-over="elementHoveredOver"
          :class="eventGhostClasses"
          @click="homeZoneCardGhostClick"
        >
          {{ playerZoneCardGhostText }}
        </EventGhost>
      </div>
      <div
        v-if="holdingCard"
        ref="holdingCard"
        :class="[
          'card',
          'holdingCard',
          {
            'card-faceDown': holdingCard.faceDown,
            'card-faceDown--player': holdingCard.faceDown,
          },
        ]"
      />
      <loading-indicator />
      <ExpandedCard />
      <ChooseStartingPlayer />
      <EscapeMenu />
    </div>

    <portal-target multiple name="match" />
    <card-choice-dialog />
    <CommanderSelection />
    <PlayerHud />
    <MatchHeader />

    <div class="cardsOnHand">
      <div class="opponentCardsOnHand field-section">
        <div
          v-for="n in opponentCardCount"
          :key="n"
          :style="getOpponentCardStyle(n - 1)"
          class="card card-faceDown"
        />
      </div>
      <PlayerCardsOnHand
        :holding-card="holdingCard"
        @cardClick="playerCardClick"
        @cardDrag="playerCardDrag"
      />
    </div>
  </div>
</template>
<script>
const Vuex = require("vuex");
const getCardImageUrl = require("../utils/getCardImageUrl.js");
const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers(
  "match"
);
const { mapGetters: mapPermissionGetters } = Vuex.createNamespacedHelpers(
  "permission"
);
const {
  mapState: mapCardState,
  mapGetters: mapCardGetters,
  mapActions: mapCardActions,
} = Vuex.createNamespacedHelpers("card");
const ghostHelpers = Vuex.createNamespacedHelpers("ghost");
const requirementHelpers = Vuex.createNamespacedHelpers("requirement");
const expandedCardHelpers = Vuex.createNamespacedHelpers("expandedCard");
const escapeMenuHelpers = Vuex.createNamespacedHelpers("escapeMenu");
const longpress = require("../utils/longpress.js");
const resolveModule = require("../utils/resolveModuleWithPossibleDefault.js");
const ZoneCard = resolveModule(require("./ZoneCard.vue"));
const StationCard = resolveModule(require("./stationCard/StationCard.vue"));
const PlayerHud = resolveModule(require("./PlayerHud.vue"));
const CardChoiceDialog = resolveModule(require("./CardChoiceDialog.vue"));
const LoadingIndicator = resolveModule(
  require("./loadingIndicator/LoadingIndicator.vue")
);
const PlayerCardsOnHand = resolveModule(require("./PlayerCardsOnHand.vue"));
const CardGhost = resolveModule(require("./CardGhost.vue"));
const EventGhost = resolveModule(require("./ghost/EventGhost.vue"));
const ExpandedCard = resolveModule(require("../expandedCard/ExpandedCard.vue"));
const ChooseStartingPlayer = resolveModule(
  require("./chooseStartingPlayer/ChooseStartingPlayer.vue")
);
const EscapeMenu = resolveModule(require("./escapeMenu/EscapeMenu.vue"));
const MatchHeader = resolveModule(require("./banner/MatchHeader.vue"));
const CommanderSelection = resolveModule(
  require("./commander/CommanderSelection.vue")
);
const PlayerCommanderCards = resolveModule(
  require("./commander/PlayerCommanderCards.vue")
);
const OpponentCommanderCards = resolveModule(
  require("./commander/OpponentCommanderCards.vue")
);
const OpponentPreGameOverlay = resolveModule(
  require("./OpponentPreGameOverlay.vue")
);
const StationCardWrapper = resolveModule(
  require("./stationCard/StationCardWrapper.vue")
);
const { PHASES } = require("./phases.js");

module.exports = {
  data() {
    return {
      elementHoveredOver: null,
      mousePosition: { x: 0, y: 0 },
      touchPosition: { x: 0, y: 0 },
      PHASES,
      bg: null,
    };
  },
  computed: {
    ...mapState([
      "matchId",
      "turn",
      "events",
      "phase",
      "opponentUser",
      "ownUser",
      "playerStation",
      "opponentStation",
      "opponentCardCount",
      "playerCardsInZone",
      "playerDiscardedCards",
      "playerCardsInOpponentZone",
      "opponentDiscardedCards",
      "opponentCardsInZone",
      "opponentCardsInPlayerZone",
      "shake",
      "flashDiscardPile",
      "flashOpponentDiscardPile",
      "opponentCardsInDeckCount",
      "playerCardsInDeckCount",
      "deckSize",
      "opponentDeckSize",
    ]),
    ...mapGetters([
      "gameOn",
      "hasPutDownNonFreeCardThisTurn",
      "actionPoints2",
      "createCard",
      "allPlayerStationCards",
      "canThePlayer",
      "selectingStartingStationCards",
      "gameConfig",
      "moveStationCard",
    ]),
    ...mapCardState([
      "transientPlayerCardsInHomeZone",
      "hiddenStationCardIds",
      "showOnlyCardGhostsFor",
      "holdingCard",
      "draggingCard",
    ]),
    ...mapCardGetters({
      cardChoiceDialogCardData: "choiceCardData",
      activeActionName: "activeActionName",
      movingStationCard: "movingStationCard",
    }),
    ...mapPermissionGetters([
      "canMoveCardsFromHand",
      "canDiscardCards",
      "canReplaceCards",
      "canPutDownCards",
      "canPutDownStationCards",
      "canPutDownMoreStationCardsThisTurn",
      "canPutDownMoreStartingStationCards",
      "canDrawCards",
      "canPassDrawPhase",
      "canMill",
      "opponentDeckIsEmpty",
    ]),
    ...requirementHelpers.mapGetters([
      "firstRequirement",
      "firstRequirementIsCounterCard",
    ]),
    ...ghostHelpers.mapGetters(["activateEventCardGhostVisible"]),
    playerZoneCardGhostClasses() {
      const classes = ["card-ghost--zone"];
      if (!this.canPutDownHoldingCard) {
        classes.push("card-ghost--deactivatedZone");
      }
      return classes;
    },
    eventGhostClasses() {
      if (!this.canPutDownHoldingCard) {
        return ["playerEventCardGhost--deactivated"];
      }
      return [];
    },
    playerZoneCardGhostVisible() {
      if (!this.holdingCard) return false;
      if (this.holdingEventCard) return false;
      if (
        this.showOnlyCardGhostsFor &&
        !this.showOnlyCardGhostsFor.includes("homeZone")
      )
        return false;

      if (this.holdingCardCannotBePlayedButGhostWithMessageShouldBeDisplayed)
        return true;
      return this.canPutDownHoldingCard;
    },
    playerZoneCardGhostText() {
      if (this.canPutDownHoldingCard) {
        return "Play card";
      }

      return "Cannot play card";
    },
    holdingCardCannotBePlayedButGhostWithMessageShouldBeDisplayed() {
      return this.canPutDownCards && !this.canPutDownHoldingCard;
    },
    canPutDownHoldingCard() {
      return this.createCard(this.holdingCard).canBePlayed();
    },
    holdingEventCard() {
      return this.holdingCard && this.holdingCard.type === "event";
    },
    discardPileCardGhostVisible() {
      return (
        this.holdingCard &&
        this.canDiscardCards &&
        (!this.showOnlyCardGhostsFor ||
          this.showOnlyCardGhostsFor.includes("discardPile"))
      );
    },
    drawStationCardGhostVisible() {
      if (!this.gameOn) {
        if (
          this.playerVisibleDrawStationCards.length > 0 &&
          (this.playerVisibleActionStationCards.length === 0 ||
            this.playerVisibleHandSizeStationCards.length === 0)
        )
          return false;
      }

      return this.stationCardGhostVisible;
    },
    actionStationCardGhostVisible() {
      if (!this.gameOn) {
        if (
          this.playerVisibleActionStationCards.length > 0 &&
          (this.playerVisibleDrawStationCards.length === 0 ||
            this.playerVisibleHandSizeStationCards.length === 0)
        )
          return false;
      }

      return this.stationCardGhostVisible;
    },
    handSizeStationCardGhostVisible() {
      if (!this.gameOn) {
        if (
          this.playerVisibleHandSizeStationCards.length > 0 &&
          (this.playerVisibleActionStationCards.length === 0 ||
            this.playerVisibleDrawStationCards.length === 0)
        )
          return false;
      }

      return this.stationCardGhostVisible;
    },
    stationCardGhostVisible() {
      if (!this.holdingCard) return false;
      if (
        this.showOnlyCardGhostsFor &&
        !this.showOnlyCardGhostsFor.includes("playerStation")
      )
        return false;

      if (this.movingStationCard) return true;

      if (!this.canPutDownStationCards) return false;

      return (
        this.canPutDownMoreStationCardsThisTurn ||
        this.canPutDownMoreStartingStationCards ||
        this.activeActionName === "putDownCard"
      );
    },
    opponentTopDiscardCard() {
      return this.opponentDiscardedCards[
        this.opponentDiscardedCards.length - 1
      ];
    },
    playerTopDiscardCard() {
      return this.playerDiscardedCards[this.playerDiscardedCards.length - 1];
    },
    visiblePlayerCards() {
      const allCards = [
        ...this.playerCardsInZone,
        ...this.transientPlayerCardsInHomeZone,
      ];
      const leftMostCardTypes = ["duration"];
      return allCards.sort(
        (a, b) =>
          leftMostCardTypes.indexOf(b.type) - leftMostCardTypes.indexOf(a.type)
      );
    },
    lastVisiblePlayerDurationCardIndex() {
      return Math.max(
        -1,
        this.visiblePlayerCards.findIndex((c) => c.type !== "duration") - 1
      );
    },
    sortedOpponentCardsInZone() {
      const cards = [...this.opponentCardsInZone];
      const leftMostCardTypes = ["duration"];
      return cards.sort(
        (a, b) =>
          leftMostCardTypes.indexOf(b.type) - leftMostCardTypes.indexOf(a.type)
      );
    },
    lastSortedOpponentDurationCardIndex() {
      return Math.max(
        -1,
        this.sortedOpponentCardsInZone.findIndex((c) => c.type !== "duration") -
          1
      );
    },
    playerVisibleDrawStationCards() {
      return this.playerStation.drawCards.filter((s) =>
        this.shouldShowStationCard(s)
      );
    },
    playerVisibleActionStationCards() {
      return this.playerStation.actionCards.filter((s) =>
        this.shouldShowStationCard(s)
      );
    },
    playerVisibleHandSizeStationCards() {
      return this.playerStation.handSizeCards.filter((s) =>
        this.shouldShowStationCard(s)
      );
    },
    opponentStationStyle() {
      return {
        opacity: 1,
      };
    },
    millCardCount() {
      return this.gameConfig.millCardCount();
    },
    playerCardPileHeight() {
      const _playerCardPileHeight = Math.round(
        Math.max(
          0,
          Math.min(15, (this.playerCardsInDeckCount / this.deckSize) * 15)
        )
      );

      if (Number.isNaN(_playerCardPileHeight)) return 1;
      return _playerCardPileHeight;
    },
    opponentCardPileHeight() {
      const _opponentCardPileHeight = Math.round(
        Math.max(
          0,
          Math.min(
            15,
            (this.opponentCardsInDeckCount / this.opponentDeckSize) * 15
          )
        )
      );
      if (Number.isNaN(_opponentCardPileHeight)) return 1;
      return _opponentCardPileHeight;
    },
  },
  watch: {
    mousePosition() {
      // USING REF AS OPTIMIZATION: When the style is computed, every getters using "holdingCard" will be recomputed.
      if (this.$refs.holdingCard) {
        this.$refs.holdingCard.style.left = this.mousePosition.x + "px";
        this.$refs.holdingCard.style.top = this.mousePosition.y + "px";
      }
    },
    async holdingCard() {
      // USING REF AS OPTIMIZATION: When the style is computed, every getters using "holdingCard" will be recomputed.
      if (this.holdingCard) {
        await this.$nextTick();

        const cardUrl = this.holdingCard.faceDown
          ? "/card/back-image"
          : getCardImageUrl.byCommonId(this.holdingCard.commonId);
        this.$refs.holdingCard.style.backgroundImage = `url(${cardUrl})`;

        this.$refs.holdingCard.style.left = this.mousePosition.x + "px";
        this.$refs.holdingCard.style.top = this.mousePosition.y + "px";
      }
    },
  },
  methods: {
    ...mapActions([
      "selectAsDefender",
      "retreat",
      "askToDrawCard",
      "passDrawPhase",
      "askToDiscardOpponentTopTwoCards",
    ]),
    ...mapCardActions({
      showCardChoiceDialog: "showChoiceDialog",
      showCardAction: "showCardAction",
      putDownCard: "putDownCard",
      putDownHoldingCard: "putDownHoldingCard",
      selectStartingStationCard: "selectStartingStationCard",
      cancelHoldingCard: "cancelHoldingCard",
      startHoldingCard: "startHoldingCard",
      discardHoldingCard: "discardHoldingCard",
      cancelCurrentUserInteraction: "cancelCurrentUserInteraction",
      selectGhostForActiveAction: "selectGhostForActiveAction",
      moveHoldingStationCard: "moveHoldingStationCard",
    }),
    ...expandedCardHelpers.mapActions(["expandCard"]),
    ...escapeMenuHelpers.mapActions({
      showEscapeMenu: "show",
    }),
    shouldShowStationCard(stationCard) {
      if (this.holdingCard) {
        if (this.holdingCard.id === stationCard.id) return false;
      }

      return !this.hiddenStationCardIds.some((id) => id === stationCard.id);
    },
    canAffordCard(card) {
      return this.actionPoints2 >= card.costToPlay;
    },
    playerCardDrag(cardData) {
      this.startHoldingCard({ cardData, dragging: true });
    },
    playerCardClick(cardData) {
      this.startHoldingCard({ cardData });
    },
    homeZoneCardGhostClick() {
      if (this.canPutDownHoldingCard) {
        this.cardGhostClick("zone");
      } else {
        this.cancelHoldingCard();
      }
    },
    cardGhostClick(location) {
      if (!this.holdingCard)
        throw new Error(
          "Should not be able to click on card ghost without holding a card"
        );

      if (this.activeActionName === "putDownCard") {
        this.selectGhostForActiveAction(location);
      } else if (location === "discard") {
        this.discardHoldingCard();
      } else if (this.movingStationCard && location.startsWith("station")) {
        this.moveHoldingStationCard({ location });
      } else if (
        this.selectingStartingStationCards &&
        location.startsWith("station")
      ) {
        this.selectStartingStationCard({
          cardId: this.holdingCard.id,
          location,
        });
      } else {
        this.putDownHoldingCard({ location });
      }
    },
    emptyClick() {
      this.cancelCurrentUserInteraction();
    },
    getOpponentCardStyle(index) {
      const cardCount = this.opponentCardCount;
      const turnDistance = 1.5;
      const startDegrees = -((cardCount - 1) * turnDistance * 0.5);
      const degrees = index * turnDistance;
      return {
        transform: "rotate(" + (startDegrees + degrees) + "deg)",
        transformOrigin: "center -1600%",
      };
    },
    getCardImageStyle(card) {
      const cardUrl = getCardImageUrl.byCommonId(card.commonId);
      return {
        backgroundImage: `url(${cardUrl})`,
      };
    },
    playerDrawPileClick() {
      this.askToDrawCard();
    },
    opponentDrawPileClick() {
      this.askToDiscardOpponentTopTwoCards();
    },
    reloadPage() {
      window.location.reload();
    },
    documentTouchmove(event) {
      if (!this.holdingCard) return;

      event.preventDefault();

      const x = event.touches[0].clientX;
      const y = event.touches[0].clientY;
      this.mousePosition = { x, y };

      this.elementHoveredOver = document.elementFromPoint(x, y);
    },
    documentTouchend() {
      if (!this.holdingCard) return;

      const elementAtPosition = document.elementFromPoint(
        this.mousePosition.x,
        this.mousePosition.y
      );
      if (elementAtPosition.className.includes("ghost")) {
        this.cardGhostClick(elementAtPosition.dataset.location);
      } else {
        setTimeout(() => {
          if (this.holdingCard) {
            this.emptyClick();
          }
        });
      }
    },
    mousemove(event) {
      this.mousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    },
    playerCardsCollideWithTimer({ opponentCards = false } = {}) {
      // playerStation-handSizeRow
      // opponentStation-handSizeRow
      const rect1 = (
        document.getElementsByClassName(
          opponentCards
            ? "opponentStation-handSizeRow"
            : "playerStation-handSizeRow"
        )[0] || {}
      ).getBoundingClientRect();
      const rect2 = (
        document.getElementsByClassName(
          opponentCards
            ? "matchHeader-opponentBanner"
            : "matchHeader-playerBanner"
        )[0] || {}
      ).getBoundingClientRect();
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    },
    isFieldFitsViewPort() {
      const rect1 = (
        document.getElementsByClassName("field-discardPile-player")[0] || {}
      ).getBoundingClientRect();
      return !(
        rect1.top > 0 &&
        rect1.left >= 0 &&
        rect1.right <=
          (window.innerWidth || document.documentElement.clientWidth) &&
        rect1.bottom <=
          (window.innerHeight || document.documentElement.clientHeight)
      );
    },
    adjustZoom() {
      const areOverlapping =
        this.playerCardsCollideWithTimer() ||
        this.playerCardsCollideWithTimer({ opponentCards: true }) ||
        this.isFieldFitsViewPort();
      if (areOverlapping) {
        const root = document.documentElement;
        let ZPosition = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--z-position")
            .replace("px", "")
        );
        ZPosition = Math.max(-50, Math.min(10, ZPosition - 1));
        root.style.setProperty("--z-position", ZPosition + "px");
        setTimeout(this.adjustZoom, 0);
      }
    },
    validateBG() {
      this.bg = localStorage.getItem("background") || "background_old";
      localStorage.setItem("background", this.bg);
    },
  },
  mounted() {
    this.validateBG();
    this.$store.dispatch("audio/background");

    document.addEventListener("mousemove", this.mousemove);

    this.$refs.match.addEventListener("click", (event) => {
      const targetElementClasses = Array.from(event.target.classList);
      const isNotCardOrCardActionOverlay =
        !targetElementClasses.includes("card") &&
        !targetElementClasses.includes("actionOverlay");
      if (
        isNotCardOrCardActionOverlay ||
        targetElementClasses.includes("card-placeholder")
      ) {
        this.emptyClick();
      }
    });
    this.$refs.match.addEventListener("mouseup", (event) => {
      if (!this.draggingCard) return;

      const isCardGhost = event.target.className.includes("ghost");
      if (!isCardGhost) {
        this.emptyClick();
      }
    });

    document.addEventListener("touchmove", this.documentTouchmove, {
      passive: false,
    });
    document.addEventListener("touchend", this.documentTouchend);
    this.adjustZoom();
  },
  destroyed() {
    document.removeEventListener("mousemove", this.mousemove);
    document.removeEventListener("touchmove", this.documentTouchmove);
    document.removeEventListener("touchend", this.documentTouchend);
  },
  components: {
    ZoneCard,
    StationCard,
    PlayerHud,
    CardChoiceDialog,
    LoadingIndicator,
    PlayerCardsOnHand,
    CardGhost,
    EventGhost,
    ExpandedCard,
    ChooseStartingPlayer,
    EscapeMenu,
    MatchHeader,
    CommanderSelection,
    PlayerCommanderCards,
    OpponentCommanderCards,
    OpponentPreGameOverlay,
    StationCardWrapper,
  },
  directives: {
    longpress,
  },
};
</script>
<style lang="scss">
@import "index";

.match-backgroundWrapper {
  background-color: #000;
  .grid-bg {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background: url(https://uploads.staticjw.com/ba/banta/grid-bg-game.png)
      no-repeat center center;
    background-size: cover;
  }
  &.animated {
    /*background: url(https://uploads.staticjw.com/ba/banta/game-bg-2500x1666-optimized.jpg) no-repeat center center;*/
    //background-image: url(https://uploads.staticjw.com/ba/banta/game-bg-2500x1080-2-optimized.jpg);
    background: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)),
      url("https://uploads.staticjw.com/ba/banta/game-bg-2500x1080-2-optimized.jpg");
    background-color: #000;

    background-size: auto 100vh;
    animation-name: bghorizontal;
    animation-duration: 320s;
    animation-iteration-count: infinite;

    .grid-bg {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      background: url(https://uploads.staticjw.com/ba/banta/grid-bg-game.png)
        no-repeat center center;
      background-size: cover;
    }
  }
}
@keyframes bghorizontal {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: calc(100vw - (100vh * 2.3)) 0; /*  2.3 is porcentage of width respect of height of the image size*/
  }
  100% {
    background-position: 0 0;
  }
}
</style>
