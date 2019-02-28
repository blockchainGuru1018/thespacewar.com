<template>
    <div ref="match" :class="['match', `currentPhase--${phase}`]">
        <div class="match-overlay"/>
        <div class="match-backgroundWrapper">
            <img class="match-background" src="/image/space2.jpg"/>
            <div class="match-backgroundOverlay"/>
        </div>
        <div class="match-header">
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
                                v-for="card in opponentStation.drawCards"
                                :stationCard="card"
                                :isOpponentStationCard="true"
                                :key="card.id"
                        />
                        <div class="stationCardWrapper stationCardWrapper--fullSize">
                            <div class="card card-placeholder"/>
                        </div>
                    </div>
                    <div class="field-stationRow">
                        <station-card
                                v-for="card in opponentStation.actionCards"
                                :stationCard="card"
                                :isOpponentStationCard="true"
                                :key="card.id"
                        />
                        <div class="stationCardWrapper stationCardWrapper--fullSize">
                            <div class="card card-placeholder"/>
                        </div>
                    </div>
                    <div class="field-stationRow">
                        <station-card
                                v-for="card in opponentStation.handSizeCards"
                                :stationCard="card"
                                :isOpponentStationCard="true"
                                :key="card.id"
                        />
                        <div class="stationCardWrapper stationCardWrapper--fullSize">
                            <div class="card card-placeholder"/>
                        </div>
                    </div>
                </div>
                <div class="field-zoneRows field-opponentZoneRows">
                    <div class="opponentCardsInZone field-opponentZoneRow field-zone field-section">
                        <template v-for="n in opponentCardsInZone.length">
                            <zone-card v-if="n <= opponentCardsInZone.length"
                                       :card="opponentCardsInZone[n - 1]"
                                       :ownerId="opponentUser.id"
                                       :zonePlayerRow="opponentCardsInZone"
                                       :zoneOpponentRow="playerCardsInOpponentZone"
                                       :key="opponentCardsInZone[n - 1].id"
                                       class="card--turnedAround"/>
                        </template>
                        <div class="card card-placeholder" v-if="opponentCardsInZone.length === 0"/>
                    </div>
                    <div class="playerCardsInOpponentZone field-opponentZoneRow field-zone field-section">
                        <template v-for="n in playerCardsInOpponentZone.length">
                            <zone-card v-if="n <= playerCardsInOpponentZone.length"
                                       :card="playerCardsInOpponentZone[n - 1]"
                                       :ownerId="ownUser.id"
                                       :zonePlayerRow="playerCardsInOpponentZone"
                                       :zoneOpponentRow="opponentCardsInZone"
                                       :key="playerCardsInOpponentZone[n - 1].id"/>
                        </template>
                        <div class="card card-placeholder" v-if="playerCardsInOpponentZone.length === 0"/>
                    </div>
                </div>
                <div class="field-piles field-section">
                    <div class="field-discardPile">
                        <div v-if="!opponentTopDiscardCard"
                             class="card card-placeholder"/>
                        <div v-else
                             :style="getCardImageStyle(opponentTopDiscardCard)"
                             :data-cardId="opponentTopDiscardCard.id"
                             class="card card--turnedAround"/>
                    </div>
                    <div class="field-drawPile">
                        <portal-target name="opponentDrawPile"/>
                        <div class="card card-faceDown">
                            <div class="actionOverlays">
                                <div v-if="canMill"
                                     @click="opponentDrawPileClick"
                                     class="drawPile-discardTopTwo actionOverlay">
                                    Mill 2
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="field-opponentCardsOnHand field-section">
                    <div
                            v-for="n in opponentCardCount"
                            :style="getOpponentCardStyle(n - 1)"
                            class="card card-faceDown"/>
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
                                <div v-if="canDrawCards"
                                     @click="playerDrawPileClick"
                                     class="drawPile-draw actionOverlay">
                                    Draw
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="field-discardPile">
                        <div class="card card-placeholder" v-if="!playerTopDiscardCard"/>
                        <div v-else
                             :style="getCardImageStyle(playerTopDiscardCard)"
                             :data-cardId="playerTopDiscardCard.id"
                             class="card"/>
                        <div v-if="discardPileCardGhostVisible"
                             @click="cardGhostClick('discard')"
                             class="discardPile-cardGhost card card-ghost"/>
                    </div>
                </div>
                <div class="field-zoneRows field-playerZoneRows">
                    <div class="opponentCardsInPlayerZone field-zone field-section">
                        <template v-for="n in opponentCardsInPlayerZone.length">
                            <zone-card v-if="n <= opponentCardsInPlayerZone.length"
                                       :card="opponentCardsInPlayerZone[n - 1]"
                                       :ownerId="opponentUser.id"
                                       :zonePlayerRow="opponentCardsInPlayerZone"
                                       :zoneOpponentRow="playerCardsInZone"
                                       :key="opponentCardsInPlayerZone[n - 1].id"
                                       class="card--turnedAround"/>
                        </template>
                        <div class="card card-placeholder" v-if="opponentCardsInPlayerZone.length === 0"/>
                    </div>
                    <div class="playerCardsInZone field-playerZoneCards field-zone field-section">
                        <template v-for="n in visiblePlayerCards.length">
                            <zone-card v-if="n <= visiblePlayerCards.length"
                                       :card="(visiblePlayerCards[n - 1])"
                                       :ownerId="ownUser.id"
                                       :zonePlayerRow="visiblePlayerCards"
                                       :zoneOpponentRow="opponentCardsInPlayerZone"
                                       :isHomeZone="true"
                                       :key="visiblePlayerCards[n - 1].id"/>
                        </template>
                        <div class="card card-placeholder" v-if="visiblePlayerCards.length === 0"/>
                        <div @click.stop="cardGhostClick('zone')"
                             class="card card-ghost card-ghost--leftAbsolute"
                             v-if="playerZoneCardGhostVisible"/>
                    </div>
                </div>
                <div class="playerStationCards field-playerStation field-station field-section">
                    <div class="field-stationRow">
                        <portal-target name="stationDrawRow"/>
                        <station-card :key="card.id"
                                      :stationCard="card"
                                      v-for="card in playerVisibleDrawStationCards"/>

                        <div class="stationCardWrapper stationCardWrapper--fullSize" v-if="stationCardGhostVisible">
                            <div @click="cardGhostClick('station-draw')"
                                 class="card card-ghost"/>
                        </div>
                    </div>
                    <div class="field-stationRow">
                        <portal-target name="stationActionRow"/>
                        <station-card :key="card.id"
                                      :stationCard="card"
                                      v-for="card in playerVisibleActionStationCards"/>
                        <div class="stationCardWrapper stationCardWrapper--fullSize" v-if="stationCardGhostVisible">
                            <div @click="cardGhostClick('station-action')"
                                 class="card card-ghost"/>
                        </div>
                    </div>
                    <div class="field-stationRow">
                        <portal-target name="stationHandSizeRow"/>
                        <station-card
                                v-for="card in playerVisibleHandSizeStationCards"
                                :stationCard="card"
                                :key="card.id"
                        />
                        <div class="stationCardWrapper stationCardWrapper--fullSize" v-if="stationCardGhostVisible">
                            <div @click="cardGhostClick('station-handSize')"
                                 class="card card-ghost"/>
                        </div>
                    </div>
                </div>
                <PlayerCardsOnHand
                        :holdingCard="holdingCard"
                        @cardClick="playerCardClick"/>
                <player-hud/>
            </div>
        </div>
        <div v-if="holdingCard" class="card holdingCard" :style="holdingCardStyle"/>
        <card-choice-dialog/>
        <loading-indicator/>
        <portal-target name="match" multiple/>
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
    const ZoneCard = require('./ZoneCard.vue').default;
    const StationCard = require('./StationCard.vue').default;
    const PlayerHud = require('./PlayerHud.vue').default;
    const CardChoiceDialog = require('./CardChoiceDialog.vue').default;
    const LoadingIndicator = require('./loadingIndicator/LoadingIndicator.vue').default;
    const PlayerCardsOnHand = require('./PlayerCardsOnHand.vue').default;
    const { PHASES } = require('./phases.js');

    module.exports = {
        data() {
            return {
                holdingCard: null,
                mousePosition: { x: 0, y: 0 },
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
        },
        components: { ZoneCard, StationCard, PlayerHud, CardChoiceDialog, LoadingIndicator, PlayerCardsOnHand }
    };
</script>
<style lang="scss">
    @import "match.scss";
    @import "stationCard.scss";
</style>