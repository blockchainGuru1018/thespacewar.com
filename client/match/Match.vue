<template>
    <div class="match-wrapper">
        <div :class="['match', `currentPhase--${phase}`]" ref="match">
            <div class="match-overlay"/>
            <div class="match-backgroundWrapper">
                <img class="match-background" src="/image/space4.PNG"/>
                <div class="match-backgroundOverlay"/>
            </div>
            <div class="match-header">
                <button @click="reloadPage" class="icon-reload"/>
                <button @click="restoreSavedMatch" class="match-smallButton">Restore match</button>
                <button @click="saveMatch" class="match-smallButton--success match-smallButton">Save match</button>
                <button @click="retreat" class="match-retreatButton match-smallButton">Retreat</button>
                <h1 :title="`Match ID: ${matchId}`">{{ ownUser.name }} v.s. {{ opponentUser.name }}</h1>
            </div>
            <div class="field">
                <div class="field-opponent">
                    <div class="field-opponentStation opponentStationCards field-station field-section">
                        <div class="field-stationRow">
                            <station-card
                                    :isOpponentStationCard="true"
                                    :key="card.id"
                                    :stationCard="card"
                                    v-for="card in opponentStation.drawCards"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <div class="card card-placeholder"/>
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <station-card
                                    :isOpponentStationCard="true"
                                    :key="card.id"
                                    :stationCard="card"
                                    v-for="card in opponentStation.actionCards"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <div class="card card-placeholder"/>
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <station-card
                                    :isOpponentStationCard="true"
                                    :key="card.id"
                                    :stationCard="card"
                                    v-for="card in opponentStation.handSizeCards"
                            />
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <div class="card card-placeholder"/>
                            </div>
                        </div>
                    </div>
                    <div class="field-zoneRows field-opponentZoneRows">
                        <div class="opponentCardsInZone field-opponentZoneRow field-zone field-section">
                            <template v-for="n in opponentCardsInZone.length">
                                <zone-card :card="opponentCardsInZone[n - 1]"
                                           :key="opponentCardsInZone[n - 1].id"
                                           :ownerId="opponentUser.id"
                                           :zoneOpponentRow="playerCardsInOpponentZone"
                                           :zonePlayerRow="opponentCardsInZone"
                                           class="card--turnedAround"
                                           v-if="n <= opponentCardsInZone.length"/>
                            </template>
                            <div class="card card-placeholder" v-if="opponentCardsInZone.length === 0"/>
                        </div>
                        <div class="playerCardsInOpponentZone field-opponentZoneRow field-zone field-section">
                            <template v-for="n in playerCardsInOpponentZone.length">
                                <zone-card :card="playerCardsInOpponentZone[n - 1]"
                                           :key="playerCardsInOpponentZone[n - 1].id"
                                           :ownerId="ownUser.id"
                                           :zoneOpponentRow="opponentCardsInZone"
                                           :zonePlayerRow="playerCardsInOpponentZone"
                                           v-if="n <= playerCardsInOpponentZone.length"/>
                            </template>
                            <div class="card card-placeholder" v-if="playerCardsInOpponentZone.length === 0"/>
                        </div>
                    </div>
                    <div class="field-piles field-section">
                        <div class="field-discardPile">
                            <div class="card card-placeholder"
                                 v-if="!opponentTopDiscardCard"/>
                            <div :data-cardId="opponentTopDiscardCard.id"
                                 :style="getCardImageStyle(opponentTopDiscardCard)"
                                 class="card card--turnedAround"
                                 v-else/>
                        </div>
                        <div class="field-drawPile">
                            <portal-target name="opponentDrawPile"/>
                            <div class="card card-faceDown">
                                <div class="actionOverlays">
                                    <div @click="opponentDrawPileClick"
                                         class="drawPile-discardTopTwo actionOverlay"
                                         v-if="canMill">
                                        Mill 2
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="field-opponentCardsOnHand field-section">
                        <div
                                :style="getOpponentCardStyle(n - 1)"
                                class="card card-faceDown"
                                v-for="n in opponentCardCount"/>
                    </div>
                </div>
                <div class="field-dividerWrapper">
                    <div class="field-divider"/>
                    <portal-target class="field-dividerContent" name="player-top" tag="div"/>
                </div>
                <div class="field-player">
                    <div class="field-piles field-section">
                        <div class="field-drawPile">
                            <portal-target name="playerDrawPile"/>
                            <div class="card card-faceDown">
                                <div class="actionOverlays">
                                    <div @click="playerDrawPileClick"
                                         class="drawPile-draw actionOverlay"
                                         v-if="canDrawCards">
                                        Draw
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="field-discardPile">
                            <div class="card card-placeholder" v-if="!playerTopDiscardCard"/>
                            <div :data-cardId="playerTopDiscardCard.id"
                                 :style="getCardImageStyle(playerTopDiscardCard)"
                                 class="card"
                                 v-else/>
                            <CardGhost :elementHoveredOver="elementHoveredOver"
                                       @click="cardGhostClick"
                                       class="discardPile-cardGhost"
                                       location="discard"
                                       v-if="discardPileCardGhostVisible"/>
                        </div>
                    </div>
                    <div class="field-zoneRows field-playerZoneRows">
                        <div class="opponentCardsInPlayerZone field-zone field-section">
                            <template v-for="n in opponentCardsInPlayerZone.length">
                                <zone-card :card="opponentCardsInPlayerZone[n - 1]"
                                           :key="opponentCardsInPlayerZone[n - 1].id"
                                           :ownerId="opponentUser.id"
                                           :zoneOpponentRow="playerCardsInZone"
                                           :zonePlayerRow="opponentCardsInPlayerZone"
                                           class="card--turnedAround"
                                           v-if="n <= opponentCardsInPlayerZone.length"/>
                            </template>
                            <div class="card card-placeholder" v-if="opponentCardsInPlayerZone.length === 0"/>
                        </div>
                        <div class="playerCardsInZone field-playerZoneCards field-zone field-section">
                            <template v-for="n in visiblePlayerCards.length">
                                <zone-card :card="(visiblePlayerCards[n - 1])"
                                           :isHomeZone="true"
                                           :key="visiblePlayerCards[n - 1].id"
                                           :ownerId="ownUser.id"
                                           :zoneOpponentRow="opponentCardsInPlayerZone"
                                           :zonePlayerRow="visiblePlayerCards"
                                           v-if="n <= visiblePlayerCards.length"/>
                            </template>

                            <template v-if="visiblePlayerCards.length === 0">
                                <CardGhost
                                        :elementHoveredOver="elementHoveredOver"
                                        @click="cardGhostClick"
                                        location="zone"
                                        v-if="playerZoneCardGhostVisible"
                                />
                                <div class="card card-placeholder" v-else/>
                            </template>
                            <CardGhost
                                    :elementHoveredOver="elementHoveredOver"
                                    @click="cardGhostClick"
                                    class="card-ghost--leftAbsolute"
                                    location="zone"
                                    v-else-if="playerZoneCardGhostVisible"/>
                        </div>
                    </div>
                    <div class="playerStationCards field-playerStation field-station field-section">
                        <div class="field-stationRow">
                            <portal-target name="stationDrawRow"/>
                            <station-card :key="card.id"
                                          :stationCard="card"
                                          v-for="card in playerVisibleDrawStationCards"/>
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <CardGhost
                                        :elementHoveredOver="elementHoveredOver"
                                        @click="cardGhostClick"
                                        location="station-draw"
                                        v-if="stationCardGhostVisible"/>
                                <div class="card card-placeholder" v-else/>
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <portal-target name="stationActionRow"/>
                            <station-card :key="card.id"
                                          :stationCard="card"
                                          v-for="card in playerVisibleActionStationCards"/>
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <CardGhost
                                        :elementHoveredOver="elementHoveredOver"
                                        @click="cardGhostClick"
                                        location="station-action"
                                        v-if="stationCardGhostVisible"/>
                                <div class="card card-placeholder" v-else/>
                            </div>
                        </div>
                        <div class="field-stationRow">
                            <portal-target name="stationHandSizeRow"/>
                            <station-card
                                    :key="card.id"
                                    :stationCard="card"
                                    v-for="card in playerVisibleHandSizeStationCards"/>
                            <div class="stationCardWrapper stationCardWrapper--fullSize">
                                <CardGhost
                                        :elementHoveredOver="elementHoveredOver"
                                        @click="cardGhostClick"
                                        location="station-handSize"
                                        v-if="stationCardGhostVisible"/>
                                <div class="card card-placeholder" v-else/>
                            </div>
                        </div>
                    </div>
                    <PlayerCardsOnHand
                            :holdingCard="holdingCard"
                            @cardClick="playerCardClick"/>
                    <player-hud/>
                </div>
            </div>
            <div :style="holdingCardStyle" class="card holdingCard" v-if="holdingCard"/>
            <card-choice-dialog/>
            <loading-indicator/>
            <portal-target multiple name="match"/>
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
                holdingCard: null,
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
                'opponentCardsInPlayerZone'
            ]),
            ...mapGetters([
                'hasPutDownNonFreeCardThisTurn',
                'actionPoints2',
                'canPutDownCard',
                'createCard',
                'allPlayerStationCards'
            ]),
            ...mapCardState([
                'transientPlayerCardsInHomeZone',
                'hiddenStationCardIds'
            ]),
            ...mapCardGetters({
                cardChoiceDialogCardData: 'choiceCardData'
            }),
            ...mapPermissionGetters([
                'canMoveCardsFromHand',
                'canDiscardCards',
                'canPutDownCards',
                'canPutDownStationCards',
                'canDrawCards',
                'canMill'
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
                    && this.canPutDownCard(this.holdingCard.id)
                    && this.canAffordCard(this.holdingCard);
            },
            discardPileCardGhostVisible() {
                return this.holdingCard && this.canDiscardCards;
            },
            stationCardGhostVisible() {
                return this.holdingCard && this.canPutDownStationCards;
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
                'discardCard',
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
                startPuttingDownCard: 'startPuttingDownCard',
                cancelCurrentUserInteraction: 'cancelCurrentUserInteraction'
            }),
            canAffordCard(card) {
                return this.actionPoints2 >= card.cost;
            },
            playerCardClick(card) {
                this.holdingCard = card;
            },
            cardGhostClick(location) {
                if (!this.holdingCard) throw Error('Should not be able to click on card ghost without holding a card');

                const cardData = this.holdingCard;

                if (location === 'discard') {
                    this.discardCard(this.holdingCard.id);
                }
                else {
                    this.startPuttingDownCard({ location, cardId: cardData.id });
                }

                this.holdingCard = null;
            },
            emptyClick() {
                if (this.holdingCard) {
                    this.holdingCard = null;
                }
                else {
                    this.cancelCurrentUserInteraction();
                }
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