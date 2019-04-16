<template>
    <div class="match-wrapper">
        <div
            ref="match"
            :class="['match', `currentPhase--${phase}`]"
        >
            <div class="match-overlay"/>
            <div class="match-backgroundWrapper">
                <img
                    class="match-background"
                    src="/image/space4.PNG"
                >
                <div class="match-backgroundOverlay"/>
            </div>
            <div class="match-header">
                <button
                    class="icon-reload"
                    @click="reloadPage"
                />
                <button
                    class="match-smallButton"
                    @click="restoreSavedMatch"
                >
                    Restore match
                </button>
                <button
                    class="match-smallButton--success match-smallButton"
                    @click="saveMatch"
                >
                    Save match
                </button>
                <button
                    class="match-retreatButton match-smallButton"
                    @click="retreat"
                >
                    Retreat
                </button>
                <h1 :title="`Match ID: ${matchId}`">
                    {{ ownUser.name }} v.s. {{ opponentUser.name }}
                </h1>
            </div>
            <div class="field">
                <div class="field-opponent">
                    <div class="field-opponentStation opponentStationCards field-station field-section">
                        <div class="field-stationRow">
                            <station-card
                                v-for="card in opponentStation.drawCards"
                                :key="card.id"
                                :is-opponent-station-card="true"
                                :station-card="card"
                                :is-holding-card="!!holdingCard"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <div class="card card-placeholder"/>
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <station-card
                                v-for="card in opponentStation.actionCards"
                                :key="card.id"
                                :is-opponent-station-card="true"
                                :station-card="card"
                                :is-holding-card="!!holdingCard"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <div class="card card-placeholder"/>
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <station-card
                                v-for="card in opponentStation.handSizeCards"
                                :key="card.id"
                                :is-opponent-station-card="true"
                                :station-card="card"
                                :is-holding-card="!!holdingCard"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <div class="card card-placeholder"/>
                            </div>
                        </div>
                    </div>
                    <div class="field-zoneRows field-opponentZoneRows">
                        <div class="opponentCardsInZone field-opponentZoneRow field-zone field-section">
                            <template v-for="n in opponentCardsInZone.length">
                                <zone-card
                                    v-if="n <= opponentCardsInZone.length"
                                    :key="opponentCardsInZone[n - 1].id"
                                    :card="opponentCardsInZone[n - 1]"
                                    :owner-id="opponentUser.id"
                                    :zone-opponent-row="playerCardsInOpponentZone"
                                    :zone-player-row="opponentCardsInZone"
                                    class="card--turnedAround"
                                />
                            </template>
                            <div
                                v-if="opponentCardsInZone.length === 0"
                                class="card card-placeholder"
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
                                v-if="playerCardsInOpponentZone.length === 0"
                                class="card card-placeholder"
                            />
                        </div>
                    </div>
                    <div class="field-piles field-section">
                        <div class="field-discardPile">
                            <div
                                v-if="!opponentTopDiscardCard"
                                class="card card-placeholder"
                            />
                            <div
                                v-else
                                :data-cardId="opponentTopDiscardCard.id"
                                :style="getCardImageStyle(opponentTopDiscardCard)"
                                class="card card--turnedAround"
                            />
                        </div>
                        <div class="field-drawPile">
                            <portal-target name="opponentDrawPile"/>
                            <div
                                v-if="!opponentDeckIsEmpty"
                                class="card card-faceDown"
                            >
                                <div class="actionOverlays">
                                    <div
                                        v-if="canMill"
                                        class="drawPile-discardTopTwo actionOverlay"
                                        @click="opponentDrawPileClick"
                                    >
                                        Mill 2
                                    </div>
                                </div>
                            </div>
                            <div
                                v-else-if="canMill"
                                class="card card-emptyDeck"
                            >
                                <div class="actionOverlays">
                                    <div
                                        class="drawPile-discardTopTwo actionOverlay"
                                        @click="opponentDrawPileClick"
                                    >
                                        Mill 2
                                    </div>
                                </div>
                            </div>
                            <div
                                v-else
                                class="card card-emptyDeck"
                            />
                            <div class="drawPile-cardCount drawPile-cardCountText">
                                {{ opponentCardsInDeckCount }}
                            </div>
                        </div>
                    </div>
                    <div class="field-opponentCardsOnHand field-section">
                        <div
                            v-for="n in opponentCardCount"
                            :key="n"
                            :style="getOpponentCardStyle(n - 1)"
                            class="card card-faceDown"
                        />
                    </div>
                </div>
                <div class="field-dividerWrapper">
                    <div class="field-divider"/>
                    <portal-target
                        class="field-dividerContent"
                        name="player-top"
                        tag="div"
                    />
                </div>
                <div class="field-player">
                    <div class="field-piles field-section">
                        <div class="field-drawPile">
                            <portal-target name="playerDrawPile"/>
                            <div
                                v-if="playerCardsInDeckCount > 0"
                                class="card card-faceDown"
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
                            <div
                                v-else-if="canDrawCards"
                                class="card card-emptyDeck"
                            >
                                <div class="actionOverlays">
                                    <div
                                        class="drawPile-draw actionOverlay actionOverlay--hinted"
                                        @click="playerDrawPileClick"
                                    >
                                        Pass
                                    </div>
                                </div>
                            </div>
                            <div
                                v-else
                                class="card card-emptyDeck"
                            />
                            <div class="drawPile-cardCount drawPile-cardCountText">
                                {{ playerCardsInDeckCount }}
                            </div>
                        </div>
                        <div class="field-discardPile">
                            <div
                                v-if="!playerTopDiscardCard"
                                class="card card-placeholder"
                            />
                            <div
                                v-else
                                :data-cardId="playerTopDiscardCard.id"
                                :style="getCardImageStyle(playerTopDiscardCard)"
                                class="card"
                            />
                            <CardGhost
                                v-if="discardPileCardGhostVisible"
                                :element-hovered-over="elementHoveredOver"
                                class="discardPile-cardGhost"
                                location="discard"
                                @click="cardGhostClick"
                            />
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
                        <div class="playerCardsInZone field-playerZoneCards field-zone field-section">
                            <template v-for="n in visiblePlayerCards.length">
                                <zone-card
                                    v-if="n <= visiblePlayerCards.length"
                                    :key="visiblePlayerCards[n - 1].id"
                                    :card="(visiblePlayerCards[n - 1])"
                                    :is-home-zone="true"
                                    :owner-id="ownUser.id"
                                    :zone-opponent-row="opponentCardsInPlayerZone"
                                    :zone-player-row="visiblePlayerCards"
                                />
                            </template>
                            <CardGhost
                                v-if="playerZoneCardGhostVisible"
                                :element-hovered-over="elementHoveredOver"
                                class="card-ghost--zone"
                                location="zone"
                                @click="cardGhostClick"
                            />
                        </div>
                    </div>
                    <div class="playerStationCards field-playerStation field-station field-section">
                        <div class="field-stationRow">
                            <portal-target name="stationDrawRow"/>
                            <station-card
                                v-for="card in playerVisibleDrawStationCards"
                                :key="card.id"
                                :station-card="card"
                                :is-holding-card="!!holdingCard"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <CardGhost
                                    v-if="stationCardGhostVisible"
                                    :element-hovered-over="elementHoveredOver"
                                    location="station-draw"
                                    @click="cardGhostClick"
                                />
                                <div
                                    v-else
                                    class="card card-placeholder"
                                />
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <portal-target name="stationActionRow"/>
                            <station-card
                                v-for="card in playerVisibleActionStationCards"
                                :key="card.id"
                                :station-card="card"
                                :is-holding-card="!!holdingCard"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <CardGhost
                                    v-if="stationCardGhostVisible"
                                    :element-hovered-over="elementHoveredOver"
                                    location="station-action"
                                    @click="cardGhostClick"
                                />
                                <div
                                    v-else
                                    class="card card-placeholder"
                                />
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <portal-target name="stationHandSizeRow"/>
                            <station-card
                                v-for="card in playerVisibleHandSizeStationCards"
                                :key="card.id"
                                :station-card="card"
                                :is-holding-card="!!holdingCard"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <CardGhost
                                    v-if="stationCardGhostVisible"
                                    :element-hovered-over="elementHoveredOver"
                                    location="station-handSize"
                                    @click="cardGhostClick"
                                />
                                <div
                                    v-else
                                    class="card card-placeholder"
                                />
                            </div>
                        </div>
                    </div>
                    <PlayerCardsOnHand
                        :holding-card="holdingCard"
                        @cardClick="playerCardClick"
                    />
                    <player-hud/>
                </div>
            </div>
            <div
                v-if="holdingCard"
                :style="holdingCardStyle"
                class="card holdingCard"
            />
            <card-choice-dialog/>
            <loading-indicator/>
            <portal-target
                multiple
                name="match"
            />
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const getCardImageUrl = require("../utils/getCardImageUrl.js")
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const {
        mapGetters: mapPermissionGetters,
    } = Vuex.createNamespacedHelpers('permission');
    const {
        mapState: mapCardState,
        mapGetters: mapCardGetters,
        mapActions: mapCardActions
    } = Vuex.createNamespacedHelpers('card');
    const resolveModule = require('../utils/resolveModuleWithPossibleDefault.js');
    const ZoneCard = resolveModule(require('./ZoneCard.vue'));
    const StationCard = resolveModule(require('./StationCard.vue'));
    const PlayerHud = resolveModule(require('./PlayerHud.vue'));
    const CardChoiceDialog = resolveModule(require('./CardChoiceDialog.vue'));
    const LoadingIndicator = resolveModule(require('./loadingIndicator/LoadingIndicator.vue'));
    const PlayerCardsOnHand = resolveModule(require('./PlayerCardsOnHand.vue'));
    const CardGhost = resolveModule(require('./CardGhost.vue'));
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
            ]),
            ...mapGetters([
                'hasPutDownNonFreeCardThisTurn',
                'actionPoints2',
                'canPutDownCard',
                'createCard',
                'allPlayerStationCards',
                'opponentCardsInDeckCount',
                'playerCardsInDeckCount'
            ]),
            ...mapCardState([
                'transientPlayerCardsInHomeZone',
                'hiddenStationCardIds',
                'showOnlyCardGhostsFor',
                'holdingCard'
            ]),
            ...mapCardGetters({
                cardChoiceDialogCardData: 'choiceCardData',
                activeActionName: 'activeActionName'
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
            holdingCardStyle() {
                if (!this.holdingCard) return {};

                const cardUrl = getCardImageUrl.byCommonId(this.holdingCard.commonId);
                return {
                    left: this.mousePosition.x + 'px',
                    top: this.mousePosition.y + 'px',
                    backgroundImage: `url(${cardUrl})`,
                    pointerEvents: 'none'
                }
            },
            playerZoneCardGhostVisible() {
                return this.holdingCard
                    && this.canPutDownCards
                    && this.canPutDownHoldingCard
                    && this.canAffordHoldingCard
                    && (!this.showOnlyCardGhostsFor || this.showOnlyCardGhostsFor.includes('homeZone'));
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
            stationCardGhostVisible() {
                if (!this.holdingCard) return false;
                if (!this.canPutDownStationCards) return false;
                if (this.showOnlyCardGhostsFor && !this.showOnlyCardGhostsFor.includes('playerStation')) return false;

                return this.canPutDownMoreStationCards
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
                return [...this.playerCardsInZone, ...this.transientPlayerCardsInHomeZone];
            },
            playerVisibleDrawStationCards() {
                return this.playerStation.drawCards.filter(s => !this.hiddenStationCardIds.some(id => id === s.id));
            },
            playerVisibleActionStationCards() {
                return this.playerStation.actionCards.filter(s => !this.hiddenStationCardIds.some(id => id === s.id));
            },
            playerVisibleHandSizeStationCards() {
                return this.playerStation.handSizeCards.filter(s => !this.hiddenStationCardIds.some(id => id === s.id));
            }
        },
        methods: {
            ...mapActions([
                'selectAsDefender',
                'retreat',
                'askToDrawCard',
                'askToDiscardOpponentTopTwoCards',
                'saveMatch',
                'restoreSavedMatch'
            ]),
            ...mapCardActions({
                showCardChoiceDialog: 'showChoiceDialog',
                showCardAction: 'showCardAction',
                putDownCard: 'putDownCard',
                putDownHoldingCard: 'putDownHoldingCard',
                cancelHoldingCard: 'cancelHoldingCard',
                startHoldingCard: 'startHoldingCard',
                discardHoldingCard: 'discardHoldingCard',
                cancelCurrentUserInteraction: 'cancelCurrentUserInteraction',
                selectGhostForActiveAction: 'selectGhostForActiveAction'
            }),
            canAffordCard(card) {
                return this.actionPoints2 >= card.cost;
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
            this.$refs.match.addEventListener('mousemove', event => {
                this.mousePosition.x = event.clientX;
                this.mousePosition.y = event.clientY;
            });
            this.$refs.match.addEventListener('click', event => {
                const targetElementClasses = Array.from(event.target.classList);
                const isNotCardOrCardActionOverlay = (!targetElementClasses.includes('card')
                    && !targetElementClasses.includes('actionOverlay'))
                if (isNotCardOrCardActionOverlay
                    || targetElementClasses.includes('card-placeholder')) {
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
            CardGhost
        }
    };
</script>
<style lang="scss">
    @import "match.scss";
    @import "stationCard.scss";
</style>