<template>
    <div :class="['match-wrapper', {shake: shake}]" ref="match-wrapper">
        <div
            :class="['match', `currentPhase--${phase}`]"
            ref="match"
        >
            <div class="match-overlay" />

            <div class="match-backgroundWrapper">
                <img
                    class="match-background"
                    src="/image/space4.PNG"
                >
                <div class="match-backgroundOverlay" />
            </div>

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
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <div class="card card-placeholder" />
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <station-card
                                :is-holding-card="!!holdingCard"
                                :is-opponent-station-card="true"
                                :key="card.id"
                                :station-card="card"
                                v-for="card in opponentStation.actionCards"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <div class="card card-placeholder" />
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <station-card
                                :is-holding-card="!!holdingCard"
                                :is-opponent-station-card="true"
                                :key="card.id"
                                :station-card="card"
                                v-for="card in opponentStation.handSizeCards"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <div class="card card-placeholder" />
                            </div>
                        </div>
                    </div>
                    <div class="field-zoneRows field-opponentZoneRows">
                        <div class="opponentCardsInZone field-opponentZoneRow field-zone field-section">
                            <template v-for="n in opponentCardsInZone.length">
                                <zone-card
                                    :card="sortedOpponentCardsInZone[n - 1]"
                                    :class="['card--turnedAround', {'card-lastDurationCard': lastSortedOpponentDurationCardIndex === (n - 1)}]"
                                    :key="sortedOpponentCardsInZone[n - 1].id"
                                    :owner-id="opponentUser.id"
                                    :zone-opponent-row="playerCardsInOpponentZone"
                                    :zone-player-row="opponentCardsInZone"
                                    v-if="n <= opponentCardsInZone.length"
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
                                    :card="playerCardsInOpponentZone[n - 1]"
                                    :key="playerCardsInOpponentZone[n - 1].id"
                                    :owner-id="ownUser.id"
                                    :zone-opponent-row="opponentCardsInZone"
                                    :zone-player-row="playerCardsInOpponentZone"
                                    v-if="n <= playerCardsInOpponentZone.length"
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
                <div class="field-dividerWrapper">
                    <div class="field-divider" />
                    <portal-target
                        class="field-dividerContent"
                        name="player-top"
                        tag="div"
                    />
                </div>
                <div class="field-player">
                    <div class="field-piles field-section">
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
                                v-else-if="canDrawCards"
                            >
                                <div class="actionOverlays">
                                    <div
                                        @click="playerDrawPileClick"
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

                        <div :class="['field-discardPile', {'flash': flashDiscardPile}]">
                            <div
                                class="card card-placeholder"
                                v-if="!playerTopDiscardCard"
                            />
                            <div
                                :data-cardId="playerTopDiscardCard.id"
                                :style="getCardImageStyle(playerTopDiscardCard)"
                                class="card card--expandable"
                                v-else
                                v-longpress="() => expandCard(playerTopDiscardCard)"
                            />
                            <CardGhost
                                :element-hovered-over="elementHoveredOver"
                                @click="cardGhostClick"
                                class="discardPile-cardGhost"
                                location="discard"
                                v-if="discardPileCardGhostVisible"
                            >
                                <div
                                    class="recycle"
                                    v-if="canThePlayer.recycleCards()"
                                >
                                    Recycle
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
                                @click="cardGhostClick"
                                class="card-ghost--zone"
                                location="zone"
                                v-if="playerZoneCardGhostVisible"
                            />
                        </div>
                    </div>
                    <div class="playerStationCards field-playerStation field-station field-section">
                        <div class="field-stationRow">
                            <portal-target name="stationDrawRow" />
                            <station-card
                                :is-holding-card="!!holdingCard"
                                :key="card.id"
                                :station-card="card"
                                v-for="card in playerVisibleDrawStationCards"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <CardGhost
                                    :element-hovered-over="elementHoveredOver"
                                    @click="cardGhostClick"
                                    location="station-draw"
                                    v-if="stationCardGhostVisible"
                                />
                                <div
                                    class="card card-placeholder"
                                    v-else
                                />
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <portal-target name="stationActionRow" />
                            <station-card
                                :is-holding-card="!!holdingCard"
                                :key="card.id"
                                :station-card="card"
                                v-for="card in playerVisibleActionStationCards"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <CardGhost
                                    :element-hovered-over="elementHoveredOver"
                                    @click="cardGhostClick"
                                    location="station-action"
                                    v-if="stationCardGhostVisible"
                                />
                                <div
                                    class="card card-placeholder"
                                    v-else
                                />
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <portal-target name="stationHandSizeRow" />
                            <station-card
                                :is-holding-card="!!holdingCard"
                                :key="card.id"
                                :station-card="card"
                                v-for="card in playerVisibleHandSizeStationCards"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <CardGhost
                                    :element-hovered-over="elementHoveredOver"
                                    @click="cardGhostClick"
                                    location="station-handSize"
                                    v-if="stationCardGhostVisible"
                                />
                                <div
                                    class="card card-placeholder"
                                    v-else
                                />
                            </div>
                        </div>
                    </div>
                    <PlayerHud />
                </div>
            </div>
            <div
                :class="['card', 'holdingCard', {'card-faceDown': holdingCard.faceDown, 'card-faceDown--player': holdingCard.faceDown}]"
                :style="holdingCardStyle"
                v-if="holdingCard"
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
    const requirementHelpers = Vuex.createNamespacedHelpers('requirement');
    const expandedCardHelpers = Vuex.createNamespacedHelpers('expandedCard');
    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');
    const longpress = require('../utils/longpress.js');
    const resolveModule = require('../utils/resolveModuleWithPossibleDefault.js');
    const ZoneCard = resolveModule(require('./ZoneCard.vue'));
    const StationCard = resolveModule(require('./StationCard.vue'));
    const PlayerHud = resolveModule(require('./PlayerHud.vue'));
    const CardChoiceDialog = resolveModule(require('./CardChoiceDialog.vue'));
    const LoadingIndicator = resolveModule(require('./loadingIndicator/LoadingIndicator.vue'));
    const PlayerCardsOnHand = resolveModule(require('./PlayerCardsOnHand.vue'));
    const CardGhost = resolveModule(require('./CardGhost.vue'));
    const ExpandedCard = resolveModule(require('../expandedCard/ExpandedCard.vue'));
    const ChooseStartingPlayer = resolveModule(require('./chooseStartingPlayer/ChooseStartingPlayer.vue'));
    const EscapeMenu = resolveModule(require('./escapeMenu/EscapeMenu.vue'));
    const MatchHeader = resolveModule(require('./banner/MatchHeader.vue'));
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
                'aiStarted',
                'shake',
                'flashDiscardPile',
                'flashOpponentDiscardPile'
            ]),
            ...mapGetters([
                'hasPutDownNonFreeCardThisTurn',
                'actionPoints2',
                'canPutDownCard',
                'createCard',
                'allPlayerStationCards',
                'opponentCardsInDeckCount',
                'playerCardsInDeckCount',
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
                'canPutDownCards',
                'canPutDownStationCards',
                'canPutDownMoreStationCards',
                'canDrawCards',
                'canMill',
                'opponentDeckIsEmpty'
            ]),
            ...requirementHelpers.mapGetters([
                'firstRequirement',
                'firstRequirementIsCounterCard'
            ]),
            holdingCardStyle() {
                if (!this.holdingCard) return {};

                const cardUrl = this.holdingCard.faceDown
                    ? '/card/back-image'
                    : getCardImageUrl.byCommonId(this.holdingCard.commonId);
                return {
                    left: this.mousePosition.x + 'px',
                    top: this.mousePosition.y + 'px',
                    backgroundImage: `url(${cardUrl})`,
                    pointerEvents: 'none'
                }
            },
            playerZoneCardGhostVisible() {
                if (!this.holdingCard) return false;
                if (this.showOnlyCardGhostsFor && !this.showOnlyCardGhostsFor.includes('homeZone')) return false;

                if (!this.canAffordHoldingCard) return false;

                return this.createCard(this.holdingCard).canBePutDownAnyTime()
                    || (this.canPutDownCards && this.canPutDownHoldingCard);
            },
            canPutDownHoldingCard() {
                return this.canPutDownCard(this.holdingCard);
            },
            canAffordHoldingCard() {
                return this.canAffordCard(this.holdingCard);
            },
            discardPileCardGhostVisible() {
                return this.holdingCard
                    && this.canDiscardCards
                    && (!this.showOnlyCardGhostsFor || this.showOnlyCardGhostsFor.includes('discardPile'));
            },
            canMoveHoldingStationCard() {
                if (!this.holdingCard) return false;
                const cardId = this.holdingCard.id;
                const stationCard = this.allPlayerStationCards.find(s => s.id === cardId);
                if (!stationCard) return false;

                return this.moveStationCard.canMove({
                    cardId: this.holdingCard.id,
                    location: `station-${stationCard.place}`
                });
            },
            stationCardGhostVisible() {
                if (!this.holdingCard) return false;

                const movingStationCard = this.movingStationCard;
                if (!this.canPutDownStationCards && !movingStationCard) return false;

                if (this.showOnlyCardGhostsFor && !this.showOnlyCardGhostsFor.includes('playerStation')) return false;

                return movingStationCard
                    || this.canPutDownMoreStationCards
                    || this.canThePlayer.putDownMoreStartingStationCards()
                    || this.activeActionName === 'putDownCard';
            },
            opponentTopDiscardCard() {
                return this.opponentDiscardedCards[this.opponentDiscardedCards.length - 1];
            },
            playerTopDiscardCard() {
                return this.playerDiscardedCards[this.playerDiscardedCards.length - 1];
            },
            calculatedActionPointsForActionPhaseVisible() {
                return this.phase === 'action'
                    && this.hasPutDownNonFreeCardThisTurn;
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
        methods: {
            ...mapActions([
                'selectAsDefender',
                'retreat',
                'askToDrawCard',
                'askToDiscardOpponentTopTwoCards',
                'saveMatch',
                'restoreSavedMatch',
                'startAI'
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
                let degrees = index * turnDistance;
                return {
                    transform: 'rotate(' + (startDegrees + degrees) + 'deg)',
                    transformOrigin: 'center -1600%'
                }
            },
            getCardInZoneStyle(card) {
                return {
                    ...this.getCardImageStyle(card)
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
            }
        },
        mounted() {
            this.$store.dispatch('audio/background');

            this.$refs.match.addEventListener('mousemove', event => {
                this.mousePosition.x = event.clientX;
                this.mousePosition.y = event.clientY;
            });
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

                const targetElementClasses = Array.from(event.target.classList);
                const isCardGhost = targetElementClasses.includes('card-ghost');
                if (!isCardGhost) {
                    this.emptyClick();
                }
            });

            document.addEventListener('touchmove', event => {
                const x = event.touches[0].clientX;
                const y = event.touches[0].clientY;
                this.mousePosition.x = x;
                this.mousePosition.y = y;

                this.elementHoveredOver = document.elementFromPoint(x, y);
            });
            document.addEventListener('touchend', event => {
                let elementAtPosition = document.elementFromPoint(this.mousePosition.x, this.mousePosition.y);
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
            });
        },
        components: {
            ZoneCard,
            StationCard,
            PlayerHud,
            CardChoiceDialog,
            LoadingIndicator,
            PlayerCardsOnHand,
            CardGhost,
            ExpandedCard,
            ChooseStartingPlayer,
            EscapeMenu,
            MatchHeader
        },
        directives: {
            longpress
        }
    };
</script>
<style lang="scss">
    @import "match.scss";
    @import "stationCard.scss";
</style>
