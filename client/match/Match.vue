<template>
    <div :class="['match-wrapper', {shake: shake}]" ref="match-wrapper">
        <div class="match-overlay" />
        <div class="match-backgroundWrapper">
<!--            <ParticlesJS></ParticlesJS>-->
            <img
                class="match-background"
                src="https://images.thespacewar.com/game-background.jpg"
            >
            <div class="match-backgroundOverlay" />
        </div>
        <div
            :class="['match', `currentPhase--${phase}`, {'match-selectingStartingStationCards': selectingStartingStationCards}]"
            ref="match"
        >
            <div class="field">
                <div class="field-opponent">
                    <div
                        :style="opponentStationStyle"
                        class="field-opponentStation opponentStationCards field-station field-section"
                    >
                        <div class="field-stationRow">
                            <station-card
                                :is-holding-card="!!holdingCard"
                                :is-opponent-station-card="true"
                                :key="card.id"
                                :station-card="card"
                                v-for="card in opponentStation.drawCards"
                            />
                            <StationCardWrapper :transparent="true" />
                        </div>
                        <div class="field-stationRow">
                            <station-card
                                :is-holding-card="!!holdingCard"
                                :is-opponent-station-card="true"
                                :key="card.id"
                                :station-card="card"
                                v-for="card in opponentStation.actionCards"
                            />
                            <StationCardWrapper :transparent="true" />
                        </div>
                        <div class="field-stationRow">
                            <station-card
                                :is-holding-card="!!holdingCard"
                                :is-opponent-station-card="true"
                                :key="card.id"
                                :station-card="card"
                                v-for="card in opponentStation.handSizeCards"
                            />
                            <StationCardWrapper :transparent="true" />
                        </div>
                    </div>
                    <div class="field-zoneRows field-opponentZoneRows">
                        <div class="opponentCardsInZone field-opponentZoneRow field-zone field-section">
                            <template v-for="n in opponentCardsInZone.length">
                                <zone-card
                                    v-if="n <= opponentCardsInZone.length"
                                    :key="sortedOpponentCardsInZone[n - 1].id"
                                    :card="sortedOpponentCardsInZone[n - 1]"
                                    :class="['card--turnedAround', {'card-lastDurationCard': lastSortedOpponentDurationCardIndex === (n - 1)}]"
                                    :owner-id="opponentUser.id"
                                    :zone-opponent-row="playerCardsInOpponentZone"
                                    :zone-player-row="opponentCardsInZone"
                                />
                            </template>
                            <div
                                class="card card-placeholder"
                                v-if="opponentCardsInZone.length === 0"
                            />
                        </div>
                        <div class="playerCardsInOpponentZone field-opponentZoneRow field-zone field-section">
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
                                class="card card-placeholder"
                                v-if="playerCardsInOpponentZone.length === 0"
                            />
                        </div>
                    </div>
                    <div class="field-piles field-section">
                        <div :class="['field-discardPile', {'flash': flashOpponentDiscardPile}]">
                            <div
                                class="card card-placeholder"
                                v-if="!opponentTopDiscardCard"
                            />
                            <div
                                :data-cardId="opponentTopDiscardCard.id"
                                :style="getCardImageStyle(opponentTopDiscardCard)"
                                class="card card--turnedAround card--expandable"
                                v-else
                                v-longpress="() => expandCard(opponentTopDiscardCard)"
                            />
                        </div>

                        <div class="field-commandersAndDrawPile">
                            <OpponentCommanderCards />
                            <div class="field-drawPile">
                                <portal-target name="opponentDrawPile" />
                                <div
                                    class="card card-faceDown"
                                    v-if="!opponentDeckIsEmpty"
                                >
                                    <div class="actionOverlays">
                                        <div
                                            @click="opponentDrawPileClick"
                                            class="drawPile-discardTopTwo actionOverlay"
                                            v-if="canMill"
                                        >
                                            Mill {{ millCardCount }}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="card card-emptyDeck"
                                    v-else-if="canMill"
                                >
                                    <div class="actionOverlays">
                                        <div
                                            @click="opponentDrawPileClick"
                                            class="drawPile-discardTopTwo actionOverlay"
                                        >
                                            Mill {{ millCardCount }}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="card card-emptyDeck"
                                    v-else
                                />
                                <div class="drawPile-cardCount drawPile-cardCountText">
                                    {{ opponentCardsInDeckCount }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <OpponentPreGameOverlay />
                </div>
                <div
                    :class="['field-dividerWrapper', {'field-dividerWrapper--placeholder': activateEventCardGhostVisible }]"
                >
                    <div class="field-divider" />
                    <portal-target
                        class="field-dividerContent"
                        name="player-top"
                        tag="div"
                    />
                </div>
                <div class="field-player">
                    <div class="field-piles field-section">
                        <div class="field-commandersAndDrawPile">
                            <PlayerCommanderCards />

                            <div class="field-drawPile">
                                <portal-target name="playerDrawPile" />
                                <div
                                    class="card card-faceDown"
                                    v-if="playerCardsInDeckCount > 0"
                                >
                                    <div class="actionOverlays">
                                        <div
                                            @click="playerDrawPileClick"
                                            class="drawPile-draw actionOverlay"
                                            v-if="canDrawCards"
                                        >
                                            Draw
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="card card-emptyDeck"
                                    v-else-if="canPassDrawPhase"
                                >
                                    <div class="actionOverlays">
                                        <div
                                            @click="passDrawPhase"
                                            class="drawPile-draw actionOverlay actionOverlay--hinted"
                                        >
                                            Pass
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="card card-emptyDeck"
                                    v-else
                                />
                                <div class="drawPile-cardCount drawPile-cardCountText">
                                    {{ playerCardsInDeckCount }}
                                </div>
                            </div>
                        </div>

                        <div :class="['field-discardPile', {'flash': flashDiscardPile}]">
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
                            />
                            <CardGhost
                                v-if="discardPileCardGhostVisible"
                                class="discardPile-cardGhost"
                                location="discard"
                                :element-hovered-over="elementHoveredOver"
                                @click="cardGhostClick"
                            >
                                <div
                                    v-if="canReplaceCards"
                                    class="replace"
                                >
                                    Replace
                                </div>
                                <div
                                    v-else
                                    class="discard"
                                >
                                    Discard
                                </div>
                            </CardGhost>
                        </div>
                    </div>
                    <div class="field-zoneRows field-playerZoneRows">
                        <div class="opponentCardsInPlayerZone field-zone field-section">
                            <template v-for="n in opponentCardsInPlayerZone.length">
                                <zone-card
                                    :card="opponentCardsInPlayerZone[n - 1]"
                                    :key="opponentCardsInPlayerZone[n - 1].id"
                                    :owner-id="opponentUser.id"
                                    :zone-opponent-row="playerCardsInZone"
                                    :zone-player-row="opponentCardsInPlayerZone"
                                    class="card--turnedAround"
                                    v-if="n <= opponentCardsInPlayerZone.length"
                                />
                            </template>
                            <div
                                class="card card-placeholder"
                                v-if="opponentCardsInPlayerZone.length === 0"
                            />
                        </div>

                        <div class="playerCardsInZone field-playerZoneCards field-zone field-section">
                            <template v-for="n in visiblePlayerCards.length">
                                <zone-card
                                    :card="(visiblePlayerCards[n - 1])"
                                    :class="{'card-lastDurationCard': lastVisiblePlayerDurationCardIndex === (n - 1)}"
                                    :isHomeZone="true"
                                    :key="visiblePlayerCards[n - 1].id"
                                    :ownerId="ownUser.id"
                                    :zoneOpponentRow="opponentCardsInPlayerZone"
                                    :zonePlayerRow="visiblePlayerCards"
                                    v-if="n <= visiblePlayerCards.length"
                                />
                            </template>
                            <CardGhost
                                :element-hovered-over="elementHoveredOver"
                                @click="homeZoneCardGhostClick"
                                :class="playerZoneCardGhostClasses"
                                location="zone"
                                v-if="playerZoneCardGhostVisible"
                            >
                                <div class="playCard">
                                    {{ playerZoneCardGhostText }}
                                </div>
                            </CardGhost>
                        </div>
                    </div>
                    <div class="playerStationCards field-playerStation field-station field-section">
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
                                stationRow="draw"
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
                                stationRow="action"
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
                                stationRow="handSize"
                            />
                            <StationCardWrapper :transparent="!handSizeStationCardGhostVisible">
                                <CardGhost
                                    v-if="handSizeStationCardGhostVisible"
                                    location="station-handSize"
                                    :element-hovered-over="elementHoveredOver"
                                    @click="cardGhostClick"
                                />
                            </StationCardWrapper>
                        </div>
                    </div>
                    <PlayerHud />
                </div>

                <EventGhost
                    v-if="activateEventCardGhostVisible"
                    :element-hovered-over="elementHoveredOver"
                    :class="eventGhostClasses"
                    @click="homeZoneCardGhostClick"
                >
                    {{ playerZoneCardGhostText }}
                </EventGhost>

                <CommanderSelection />
            </div>
            <div
                v-if="holdingCard"
                ref="holdingCard"
                :class="['card', 'holdingCard', {'card-faceDown': holdingCard.faceDown, 'card-faceDown--player': holdingCard.faceDown}]"
            />
            <card-choice-dialog />
            <loading-indicator />
            <portal-target
                multiple
                name="match"
            />
            <ExpandedCard />
            <ChooseStartingPlayer />
            <EscapeMenu />
        </div>

        <MatchHeader />

        <div class="cardsOnHand">
            <div class="opponentCardsOnHand field-section">
                <div
                    :key="n"
                    :style="getOpponentCardStyle(n - 1)"
                    class="card card-faceDown"
                    v-for="n in opponentCardCount"
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
    const Vuex = require('vuex');
    const getCardImageUrl = require("../utils/getCardImageUrl.js");
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const {
        mapGetters: mapPermissionGetters,
    } = Vuex.createNamespacedHelpers('permission');
    const {
        mapState: mapCardState,
        mapGetters: mapCardGetters,
        mapActions: mapCardActions
    } = Vuex.createNamespacedHelpers('card');
    const ghostHelpers = Vuex.createNamespacedHelpers('ghost');
    const requirementHelpers = Vuex.createNamespacedHelpers('requirement');
    const expandedCardHelpers = Vuex.createNamespacedHelpers('expandedCard');
    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');
    const longpress = require('../utils/longpress.js');
    const resolveModule = require('../utils/resolveModuleWithPossibleDefault.js');
    const ZoneCard = resolveModule(require('./ZoneCard.vue'));
    const StationCard = resolveModule(require('./stationCard/StationCard.vue'));
    const PlayerHud = resolveModule(require('./PlayerHud.vue'));
    const CardChoiceDialog = resolveModule(require('./CardChoiceDialog.vue'));
    const LoadingIndicator = resolveModule(require('./loadingIndicator/LoadingIndicator.vue'));
    const PlayerCardsOnHand = resolveModule(require('./PlayerCardsOnHand.vue'));
    const CardGhost = resolveModule(require('./CardGhost.vue'));
    const EventGhost = resolveModule(require('./ghost/EventGhost.vue'));
    const ExpandedCard = resolveModule(require('../expandedCard/ExpandedCard.vue'));
    const ChooseStartingPlayer = resolveModule(require('./chooseStartingPlayer/ChooseStartingPlayer.vue'));
    const EscapeMenu = resolveModule(require('./escapeMenu/EscapeMenu.vue'));
    const MatchHeader = resolveModule(require('./banner/MatchHeader.vue'));
    const CommanderSelection = resolveModule(require('./commander/CommanderSelection.vue'));
    const PlayerCommanderCards = resolveModule(require('./commander/PlayerCommanderCards.vue'));
    const OpponentCommanderCards = resolveModule(require('./commander/OpponentCommanderCards.vue'));
    const OpponentPreGameOverlay = resolveModule(require('./OpponentPreGameOverlay.vue'));
    const StationCardWrapper = resolveModule(require('./stationCard/StationCardWrapper.vue'));
    const { PHASES } = require('./phases.js');

    module.exports = {
        data() {
            return {
                elementHoveredOver: null,
                mousePosition: { x: 0, y: 0 },
                touchPosition: { x: 0, y: 0 },
                PHASES
            }
        },
        computed: {
            ...mapState([
                'matchId',
                'turn',
                'events',
                'phase',
                'opponentUser',
                'ownUser',
                'playerStation',
                'opponentStation',
                'opponentCardCount',
                'playerCardsInZone',
                'playerDiscardedCards',
                'playerCardsInOpponentZone',
                'opponentDiscardedCards',
                'opponentCardsInZone',
                'opponentCardsInPlayerZone',
                'shake',
                'flashDiscardPile',
                'flashOpponentDiscardPile',
                'opponentCardsInDeckCount',
                'playerCardsInDeckCount',
            ]),
            ...mapGetters([
                'gameOn',
                'hasPutDownNonFreeCardThisTurn',
                'actionPoints2',
                'createCard',
                'allPlayerStationCards',
                'canThePlayer',
                'selectingStartingStationCards',
                'gameConfig',
                'moveStationCard'
            ]),
            ...mapCardState([
                'transientPlayerCardsInHomeZone',
                'hiddenStationCardIds',
                'showOnlyCardGhostsFor',
                'holdingCard',
                'draggingCard'
            ]),
            ...mapCardGetters({
                cardChoiceDialogCardData: 'choiceCardData',
                activeActionName: 'activeActionName',
                movingStationCard: 'movingStationCard'
            }),
            ...mapPermissionGetters([
                'canMoveCardsFromHand',
                'canDiscardCards',
                'canReplaceCards',
                'canPutDownCards',
                'canPutDownStationCards',
                'canPutDownMoreStationCardsThisTurn',
                'canPutDownMoreStartingStationCards',
                'canDrawCards',
                'canPassDrawPhase',
                'canMill',
                'opponentDeckIsEmpty'
            ]),
            ...requirementHelpers.mapGetters([
                'firstRequirement',
                'firstRequirementIsCounterCard'
            ]),
            ...ghostHelpers.mapGetters([
                'activateEventCardGhostVisible'
            ]),
            playerZoneCardGhostClasses() {
                const classes = ['card-ghost--zone'];
                if (!this.canPutDownHoldingCard) {
                    classes.push('card-ghost--deactivatedZone');
                }
                return classes;
            },
            eventGhostClasses() {
                if (!this.canPutDownHoldingCard) {
                    return ['playerEventCardGhost--deactivated'];
                }
                return [];
            },
            playerZoneCardGhostVisible() {
                if (!this.holdingCard) return false;
                if (this.holdingEventCard) return false;
                if (this.showOnlyCardGhostsFor && !this.showOnlyCardGhostsFor.includes('homeZone')) return false;

                if (this.holdingCardCannotBePlayedButGhostWithMessageShouldBeDisplayed) return true;
                return this.canPutDownHoldingCard;
            },
            playerZoneCardGhostText() {
                if (this.canPutDownHoldingCard) {
                    return 'Play card';
                }

                return 'Cannot play card';
            },
            holdingCardCannotBePlayedButGhostWithMessageShouldBeDisplayed() {
                return this.canPutDownCards
                    && !this.canPutDownHoldingCard;
            },
            canPutDownHoldingCard() {
                return this.createCard(this.holdingCard).canBePlayed()
            },
            holdingEventCard() {
                return this.holdingCard && this.holdingCard.type === 'event';
            },
            discardPileCardGhostVisible() {
                return this.holdingCard
                    && this.canDiscardCards
                    && (!this.showOnlyCardGhostsFor || this.showOnlyCardGhostsFor.includes('discardPile'));
            },
            drawStationCardGhostVisible() {
                if (!this.gameOn) {
                    if (this.playerVisibleDrawStationCards.length > 0
                        && (this.playerVisibleActionStationCards.length === 0
                            || this.playerVisibleHandSizeStationCards.length === 0)) return false;
                }

                return this.stationCardGhostVisible;
            },
            actionStationCardGhostVisible() {
                if (!this.gameOn) {
                    if (this.playerVisibleActionStationCards.length > 0
                        && (this.playerVisibleDrawStationCards.length === 0
                            || this.playerVisibleHandSizeStationCards.length === 0)) return false;
                }

                return this.stationCardGhostVisible;
            },
            handSizeStationCardGhostVisible() {
                if (!this.gameOn) {
                    if (this.playerVisibleHandSizeStationCards.length > 0
                        && (this.playerVisibleActionStationCards.length === 0
                            || this.playerVisibleDrawStationCards.length === 0)) return false;
                }

                return this.stationCardGhostVisible;
            },
            stationCardGhostVisible() {
                if (!this.holdingCard) return false;
                if (this.showOnlyCardGhostsFor && !this.showOnlyCardGhostsFor.includes('playerStation')) return false;

                if (this.movingStationCard) return true;

                if (!this.canPutDownStationCards) return false;

                return this.canPutDownMoreStationCardsThisTurn
                    || this.canPutDownMoreStartingStationCards
                    || this.activeActionName === 'putDownCard';
            },
            opponentTopDiscardCard() {
                return this.opponentDiscardedCards[this.opponentDiscardedCards.length - 1];
            },
            playerTopDiscardCard() {
                return this.playerDiscardedCards[this.playerDiscardedCards.length - 1];
            },
            visiblePlayerCards() {
                const allCards = [...this.playerCardsInZone, ...this.transientPlayerCardsInHomeZone];
                const leftMostCardTypes = ['duration'];
                return allCards.sort((a, b) => leftMostCardTypes.indexOf(b.type) - leftMostCardTypes.indexOf(a.type));
            },
            lastVisiblePlayerDurationCardIndex() {
                return Math.max(-1, this.visiblePlayerCards.findIndex(c => c.type !== 'duration') - 1);
            },
            sortedOpponentCardsInZone() {
                const cards = [...this.opponentCardsInZone];
                const leftMostCardTypes = ['duration'];
                return cards.sort((a, b) => leftMostCardTypes.indexOf(b.type) - leftMostCardTypes.indexOf(a.type));
            },
            lastSortedOpponentDurationCardIndex() {
                return Math.max(-1, this.sortedOpponentCardsInZone.findIndex(c => c.type !== 'duration') - 1);
            },
            playerVisibleDrawStationCards() {
                return this.playerStation.drawCards.filter(s => this.shouldShowStationCard(s));
            },
            playerVisibleActionStationCards() {
                return this.playerStation.actionCards.filter(s => this.shouldShowStationCard(s));
            },
            playerVisibleHandSizeStationCards() {
                return this.playerStation.handSizeCards.filter(s => this.shouldShowStationCard(s));
            },
            opponentStationStyle() {
                return {
                    opacity: this.selectingStartingStationCards ? 0 : 1
                };
            },
            millCardCount() {
                return this.gameConfig.millCardCount();
            }
        },
        watch: {
            mousePosition() { // USING REF AS OPTIMIZATION: When the style is computed, every getters using "holdingCard" will be recomputed.
                if (this.$refs.holdingCard) {
                    this.$refs.holdingCard.style.left = this.mousePosition.x + 'px';
                    this.$refs.holdingCard.style.top = this.mousePosition.y + 'px';
                }
            },
            async holdingCard() { // USING REF AS OPTIMIZATION: When the style is computed, every getters using "holdingCard" will be recomputed.
                if (this.holdingCard) {
                    await this.$nextTick();

                    const cardUrl = this.holdingCard.faceDown
                        ? '/card/back-image'
                        : getCardImageUrl.byCommonId(this.holdingCard.commonId);
                    this.$refs.holdingCard.style.backgroundImage = `url(${cardUrl})`;

                    this.$refs.holdingCard.style.left = this.mousePosition.x + 'px';
                    this.$refs.holdingCard.style.top = this.mousePosition.y + 'px';
                }
            }
        },
        methods: {
            ...mapActions([
                'selectAsDefender',
                'retreat',
                'askToDrawCard',
                'passDrawPhase',
                'askToDiscardOpponentTopTwoCards',
            ]),
            ...mapCardActions({
                showCardChoiceDialog: 'showChoiceDialog',
                showCardAction: 'showCardAction',
                putDownCard: 'putDownCard',
                putDownHoldingCard: 'putDownHoldingCard',
                selectStartingStationCard: 'selectStartingStationCard',
                cancelHoldingCard: 'cancelHoldingCard',
                startHoldingCard: 'startHoldingCard',
                discardHoldingCard: 'discardHoldingCard',
                cancelCurrentUserInteraction: 'cancelCurrentUserInteraction',
                selectGhostForActiveAction: 'selectGhostForActiveAction',
                moveHoldingStationCard: 'moveHoldingStationCard'
            }),
            ...expandedCardHelpers.mapActions([
                'expandCard'
            ]),
            ...escapeMenuHelpers.mapActions({
                showEscapeMenu: 'show'
            }),
            shouldShowStationCard(stationCard) {
                if (this.holdingCard) {
                    if (this.holdingCard.id === stationCard.id) return false;
                }

                return !this.hiddenStationCardIds.some(id => id === stationCard.id);
            },
            canAffordCard(card) {
                return this.actionPoints2 >= card.cost;
            },
            playerCardDrag(cardData) {
                this.startHoldingCard({ cardData, dragging: true });
            },
            playerCardClick(cardData) {
                this.startHoldingCard({ cardData });
            },
            homeZoneCardGhostClick() {
                if (this.canPutDownHoldingCard) {
                    this.cardGhostClick('zone');
                }
                else {
                    this.cancelHoldingCard();
                }
            },
            cardGhostClick(location) {
                if (!this.holdingCard) throw new Error('Should not be able to click on card ghost without holding a card');

                if (this.activeActionName === 'putDownCard') {
                    this.selectGhostForActiveAction(location);
                }
                else if (location === 'discard') {
                    this.discardHoldingCard();
                }
                else if (this.movingStationCard && location.startsWith('station')) {
                    this.moveHoldingStationCard({ location });
                }
                else if (this.selectingStartingStationCards && location.startsWith('station')) {
                    this.selectStartingStationCard({ cardId: this.holdingCard.id, location });
                }
                else {
                    this.putDownHoldingCard({ location });
                }
            },
            emptyClick() {
                this.cancelCurrentUserInteraction();
            },
            getOpponentCardStyle(index) {
                const cardCount = this.opponentCardCount;
                const turnDistance = 1.5;
                const startDegrees = -((cardCount - 1) * turnDistance * .5);
                const degrees = index * turnDistance;
                return {
                    transform: 'rotate(' + (startDegrees + degrees) + 'deg)',
                    transformOrigin: 'center -1600%'
                }
            },
            getCardImageStyle(card) {
                const cardUrl = getCardImageUrl.byCommonId(card.commonId);
                return {
                    backgroundImage: `url(${cardUrl})`
                }
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

                const elementAtPosition = document.elementFromPoint(this.mousePosition.x, this.mousePosition.y);
                if (elementAtPosition.className.includes('ghost')) {
                    this.cardGhostClick(elementAtPosition.dataset.location);
                }
                else {
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
                    y: event.clientY
                };
            }
        },
        mounted() {
            this.$store.dispatch('audio/background');

            document.addEventListener('mousemove', this.mousemove);

            this.$refs.match.addEventListener('click', event => {
                const targetElementClasses = Array.from(event.target.classList);
                const isNotCardOrCardActionOverlay = (!targetElementClasses.includes('card')
                    && !targetElementClasses.includes('actionOverlay'));
                if (isNotCardOrCardActionOverlay
                    || targetElementClasses.includes('card-placeholder')) {
                    this.emptyClick();
                }
            });
            this.$refs.match.addEventListener('mouseup', event => {
                if (!this.draggingCard) return;

                const isCardGhost = event.target.className.includes('ghost');
                if (!isCardGhost) {
                    this.emptyClick();
                }
            });

            document.addEventListener('touchmove', this.documentTouchmove, { passive: false });
            document.addEventListener('touchend', this.documentTouchend);
        },
        destroyed() {
            document.removeEventListener('mousemove', this.mousemove);
            document.removeEventListener('touchmove', this.documentTouchmove);
            document.removeEventListener('touchend', this.documentTouchend);
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
            longpress
        }
    };
</script>
<style lang="scss">
    @import "index";
</style>
