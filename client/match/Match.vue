<template>
    <div ref="match" class="match">
        <div class="match-header">
            <button @click="restoreSavedMatch" class="match-smallButton">Restore match</button>
            <button @click="saveMatch" class="match-smallButton--success match-smallButton">Save match</button>
            <button @click="retreat" class="match-retreatButton match-smallButton">Retreat</button>
            <h1 :title="`Match ID: ${matchId}`">{{ ownUser.name }} v.s. {{ opponentUser.name }}</h1>
        </div>
        <div class="field">
            <div class="field-opponent">
                <div class="field-opponentStation field-station field-section">
                    <div class="field-stationRow">
                        <station-card
                                v-for="card in opponentStation.drawCards"
                                :stationCard="card"
                                :isOpponentStationCard="true"
                                :key="card.id"
                        />
                    </div>
                    <div class="field-stationRow">
                        <station-card
                                v-for="card in opponentStation.actionCards"
                                :stationCard="card"
                                :isOpponentStationCard="true"
                                :key="card.id"
                        />
                    </div>
                    <div class="field-stationRow">
                        <station-card
                                v-for="card in opponentStation.handSizeCards"
                                :stationCard="card"
                                :isOpponentStationCard="true"
                                :key="card.id"
                        />
                    </div>
                </div>
                <div class="field-zoneRows field-opponentZoneRows">
                    <div class="field-zone field-section">
                        <template v-for="n in 6">
                            <zone-card v-if="n <= opponentCardsInZone.length"
                                       :card="opponentCardsInZone[n - 1]"
                                       :ownerId="opponentUser.id"
                                       :zonePlayerRow="opponentCardsInZone"
                                       :zoneOpponentRow="playerCardsInOpponentZone"
                                       :key="opponentCardsInZone[n - 1].id"
                                       class="card--turnedAround"/>
                            <div v-else class="card card--placeholder"/>
                        </template>
                    </div>
                    <div class="field-zone field-section playerCardsInOpponentZone">
                        <template v-for="n in 6">
                            <zone-card v-if="n <= playerCardsInOpponentZone.length"
                                       :card="playerCardsInOpponentZone[n - 1]"
                                       :ownerId="ownUser.id"
                                       :zonePlayerRow="playerCardsInOpponentZone"
                                       :zoneOpponentRow="opponentCardsInZone"
                                       :key="playerCardsInOpponentZone[n - 1].id"/>
                            <div v-else class="card card--placeholder"/>
                        </template>
                    </div>
                </div>
                <div class="field-piles field-section">
                    <div class="field-discardPile">
                        <div v-if="opponentDiscardedCards.length === 0"
                             class="card card--placeholder"/>
                        <div v-else
                             :style="getCardImageStyle(opponentTopDiscardCard)"
                             :data-cardId="opponentTopDiscardCard.id"
                             class="card card--turnedAround"/>
                    </div>
                    <div class="field-drawPile">
                        <div v-if="phase === PHASES.draw" class="card card-faceDown">
                            <div class="actionOverlays">
                                <div @click="opponentDrawPileClick" class="drawPile-discardTopTwo actionOverlay">
                                    Discard 2
                                </div>
                            </div>
                        </div>
                        <div v-else class="card card-faceDown"/>
                    </div>
                </div>
                <div class="field-opponentCardsOnHand field-section">
                    <div
                            v-for="n in opponentCardCount"
                            :style="getOpponentCardStyle(n - 1)"
                            class="card card-faceDown"/>
                </div>
            </div>
            <div class="field-player">
                <div class="field-piles field-section">
                    <div v-if="showActionPoints" class="playerActionPointsContainer">
                        <div class="playerActionPoints">
                            {{ playerActionPointsText }}
                        </div>
                    </div>
                    <div class="field-drawPile">
                        <div v-if="phase === PHASES.draw" class="card card-faceDown">
                            <div class="actionOverlays">
                                <div @click="playerDrawPileClick" class="drawPile-draw actionOverlay">
                                    Draw
                                </div>
                            </div>
                        </div>
                        <div v-else class="card card-faceDown"/>
                    </div>
                    <div class="field-discardPile">
                        <div v-if="playerDiscardedCards.length === 0" class="card card--placeholder"/>
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
                    <div class="field-zone field-section">
                        <template v-for="n in 6">
                            <zone-card v-if="n <= opponentCardsInPlayerZone.length"
                                       :card="opponentCardsInPlayerZone[n - 1]"
                                       :ownerId="opponentUser.id"
                                       :zonePlayerRow="opponentCardsInPlayerZone"
                                       :zoneOpponentRow="playerCardsInZone"
                                       :key="opponentCardsInPlayerZone[n - 1].id"
                                       class="card--turnedAround"/>
                            <div v-else class="card card--placeholder"/>
                        </template>
                    </div>
                    <div class="field-playerZoneCards field-zone field-section">
                        <template v-for="n in 6">
                            <zone-card v-if="n <= playerCardsInZone.length"
                                       :card="(playerCardsInZone[n - 1])"
                                       :ownerId="ownUser.id"
                                       :zonePlayerRow="playerCardsInZone"
                                       :zoneOpponentRow="opponentCardsInPlayerZone"
                                       :isHomeZone="true"
                                       :key="playerCardsInZone[n - 1].id"/>
                            <div v-else-if="playerZoneCardGhostVisible"
                                 @click="cardGhostClick('zone')"
                                 class="card card-ghost"/>
                            <div v-else class="card card--placeholder"/>
                        </template>
                    </div>
                </div>
                <div class="field-playerStation field-station field-section">
                    <div class="field-stationRow">
                        <station-card
                                v-for="card in playerStation.drawCards"
                                :stationCard="card"
                                :key="card.id"
                        />
                        <div v-if="stationCardGhostVisible"
                             @click="cardGhostClick('station-draw')"
                             class="card card-ghost"/>
                        <div v-else class="card card--placeholder"/>
                    </div>
                    <div class="field-stationRow">
                        <station-card
                                v-for="card in playerStation.actionCards"
                                :stationCard="card"
                                :key="card.id"
                        />
                        <div v-if="stationCardGhostVisible"
                             @click="cardGhostClick('station-action')"
                             class="card card-ghost"/>
                        <div v-else class="card card--placeholder"/>
                    </div>
                    <div class="field-stationRow">
                        <station-card
                                v-for="card in playerStation.handSizeCards"
                                :stationCard="card"
                                :key="card.id"
                        />
                        <div v-if="stationCardGhostVisible"
                             @click="cardGhostClick('station-handSize')"
                             class="card card-ghost"/>
                        <div v-else class="card card--placeholder"/>
                    </div>
                </div>
                <div class="field-playerCardsOnHand field-section">
                    <div
                            v-for="card, index in playerCardModels"
                            v-if="card !== holdingCard"
                            :style="getCardOnHandStyle(card, index)"
                            :class="getPlayerCardClasses(card)"
                            @click="playerCardClick(card)"/>
                </div>
                <player-hud/>
            </div>
        </div>
        <div v-if="holdingCard" class="card holdingCard" :style="holdingCardStyle"/>
        <portal-target name="match" multiple/>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const ZoneCard = require('./ZoneCard.vue').default;
    const StationCard = require('./StationCard.vue').default;
    const PlayerHud = require('./PlayerHud.vue').default;
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
                'currentPlayer',
                'events',
                'phase',
                'opponentUser',
                'ownUser',
                'playerCardsOnHand',
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
                'playerCardModels',
                'hasPutDownNonFreeCardThisTurn',
                'actionPoints2'
            ]),
            isOwnTurn() {
                return this.ownUser.id === this.currentPlayer;
            },
            holdingCardStyle() {
                if (!this.holdingCard) return {};

                return {
                    left: this.mousePosition.x + 'px',
                    top: this.mousePosition.y + 'px',
                    backgroundImage: 'url(/card/' + this.holdingCard.commonId + '/image)',
                    pointerEvents: 'none'
                }
            },
            playerZoneCardGhostVisible() {
                return this.phase === 'action'
                    && this.holdingCard
                    && this.canAffordCard(this.holdingCard);
            },
            opponentTopDiscardCard() {
                return this.opponentDiscardedCards[this.opponentDiscardedCards.length - 1];
            },
            playerTopDiscardCard() {
                return this.playerDiscardedCards[this.playerDiscardedCards.length - 1];
            },
            discardPileCardGhostVisible() {
                return this.holdingCard &&
                    (this.phase === 'action'
                        || this.phase === 'discard');
            },
            stationCardGhostVisible() {
                const hasAlreadyPutDownStationCard = this.events.some(e => {
                    return e.turn === this.turn
                        && e.type === 'putDownCard'
                        && e.location.startsWith('station');
                })
                return this.phase === 'action'
                    && this.holdingCard
                    && !hasAlreadyPutDownStationCard;
            },
            canPlaceCards() {
                return this.isOwnTurn;
            },
            calculatedActionPointsForActionPhaseVisible() {
                return this.phase === 'action'
                    && this.hasPutDownNonFreeCardThisTurn;
            },
            nextActionPointsFromStationCards() {
                if (this.phase === 'action') {
                    return 0;
                }
                return this.playerStation.actionCards.length * 2;
            },
            playerActionPointsText() {
                if (this.calculatedActionPointsForActionPhaseVisible) {
                    return `Actions ${ this.actionPoints2 }`;
                }
                else {
                    return `Actions (${this.actionPoints2})`
                }
            },
            showActionPoints() {
                return ['preparation', 'draw', 'action'].includes(this.phase);
            }
        },
        methods: {
            ...mapActions([
                'init',
                'putDownCard',
                'discardCard',
                'selectAsDefender',
                'retreat',
                'cancelCurrentAction',
                'askToDrawCard',
                'askToDiscardOpponentTopTwoCards',
                'saveMatch',
                'restoreSavedMatch'
            ]),
            canAffordCard(card) {
                return this.actionPoints2 >= card.cost;
            },
            playerCardClick(card) {
                if (this.canPlaceCards) {
                    this.holdingCard = card;
                }
            },
            cardGhostClick(location) {
                if (location === 'discard') {
                    this.discardCard(this.holdingCard.id);
                }
                else {
                    this.putDownCard({ location, cardId: this.holdingCard.id });
                }
                this.holdingCard = null;
            },
            emptyClick() {
                if (this.holdingCard) {
                    this.holdingCard = null;
                }
                else {
                    this.cancelCurrentAction();
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
            getPlayerCardClasses(card) {
                const classes = ['card'];
                if (card.highlighted) {
                    classes.push('card--highlight');
                }
                if (!this.holdingCard) {
                    classes.push('card--hoverable');
                }
                return classes;
            },
            getCardOnHandStyle(card, index) {
                const cardCount = this.playerCardsOnHand.length;
                const turnDistance = 1.5;
                const startDegrees = -((cardCount - 1) * turnDistance * .5);
                let degrees = index * turnDistance;
                return {
                    transform: 'rotate(' + (startDegrees + degrees) + 'deg)',
                    transformOrigin: 'center 1600%',
                    backgroundImage: 'url(/card/' + card.commonId + '/image)'
                }
            },
            getCardInZoneStyle(card) {
                return {
                    ...this.getCardImageStyle(card)
                }
            },
            getCardImageStyle(card) {
                return {
                    backgroundImage: 'url(/card/' + card.commonId + '/image)'
                }
            },
            playerDrawPileClick() {
                this.askToDrawCard();
            },
            opponentDrawPileClick() {
                this.askToDiscardOpponentTopTwoCards();
            }
        },
        created() {
            this.init();
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
                    || targetElementClasses.includes('card--placeholder')) {
                    this.emptyClick();
                }
            });
        },
        components: { ZoneCard, StationCard, PlayerHud }
    };
</script>
<style scoped lang="scss">
    $cardWidth: 652px;
    $cardHeight: 916px;
    $opponentCardWidth: calc(#{$cardWidth} / 8);
    $opponentCardHeight: calc(#{$cardHeight} / 8);
    $opponentCardOnHandWidth: calc(#{$cardWidth} / 12);
    $opponentCardOnHandHeight: calc(#{$cardHeight} / 12);
    $opponentStationCardWidth: calc(#{$cardWidth} / 12);
    $opponentStationCardHeight: calc(#{$cardHeight} / 12);
    $opponentDrawPileCardWidth: calc(#{$cardWidth} / 12);
    $opponentDrawPileCardHeight: calc(#{$cardHeight} / 12);
    $opponentDiscardPileCardWidth: calc(#{$cardWidth} / 12);
    $opponentDiscardPileCardHeight: calc(#{$cardHeight} / 12);

    $playerCardWidth: calc(#{$cardWidth} / 5);
    $playerCardHeight: calc(#{$cardHeight} / 5);
    $playerStationCardWidth: calc((#{$cardWidth} / 5) * .7);
    $playerStationCardHeight: calc((#{$cardHeight} / 5) * .7);
    $playerDiscardPileCardWidth: $playerCardWidth;
    $playerDiscardPileCardHeight: $playerCardHeight;
    $playerDrawPileCardWidth: $playerCardWidth;
    $playerDrawPileCardHeight: $playerCardHeight;

    $cardHoverWidth: $cardWidth / 4;
    $cardHoverHeight: $cardHeight / 4;

    .match {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    .match-header {
        position: absolute;
        right: 14px;
        top: 0;
        display: flex;
        align-items: center;
        z-index: 3;
        font-family: Helvetica, sans-serif;
        color: #333;
    }

    .match-smallButton {
        background-color: #35A7FF;
        color: rgba(255, 255, 255, 1);
        box-shadow: 0 1px 6px 1px rgba(0, 0, 0, 0.2);;
        border: none;
        font-size: 14px;
        padding: 8px 12px;
        margin-right: 16px;
        letter-spacing: .11em;

        &:active {
            outline: 2px solid rgba(0, 0, 0, .3);
        }

        &:focus, &:hover {
            background-color: #66bdff;
            outline: 0;
        }
    }

    .match-smallButton--success {
        background-color: #51c870;

        &:focus, &:hover {
            background-color: #68cc88;
        }
    }

    .match-retreatButton {
        background-color: #ff3646;

        &:focus, &:hover {
            background-color: #ff6670;
        }
    }

    .field {
        flex: 1 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .field-player, .field-opponent {
        width: 100%;
        display: flex;
        align-items: stretch;
        justify-content: space-between;
        position: relative;
    }

    .field-player {
        flex: 0 0 60%;
    }

    .field-opponent {
        flex: 0 0 40%;

        .card {
            width: $opponentCardWidth;
            height: $opponentCardHeight;
        }
    }

    .field-playerStation {
        flex-direction: column;
        margin-right: 8px;

        .card {
            width: $playerStationCardWidth;
            height: $playerStationCardHeight;

            margin-right: 8px;

            &:last-child {
                margin-right: 0;
            }
        }
    }

    .field-opponentStation {
        flex-direction: column;
        margin-top: 5px;

        .card {
            width: $opponentStationCardWidth;
            height: $opponentStationCardHeight;
            margin-left: 8px;

            &:last-child {
                margin-left: 0;
            }
        }
    }

    .field-opponentStation .field-stationRow {
        flex-direction: row-reverse;
    }

    .field-station {
        display: flex;
        flex: 0 0 20%;
    }

    .field-stationRow {
        display: flex;
        margin-bottom: 8px;
    }

    .field-piles {
        flex: 0 0 12%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        position: relative;
    }

    .field-drawPile {
        .card {
            width: 100%;
            height: 100%;
        }

        .field-player & {
            width: $playerDrawPileCardWidth;
            height: $playerDrawPileCardHeight;
        }

        .field-opponent & {
            width: $opponentDrawPileCardWidth;
            height: $opponentDrawPileCardHeight;
        }
    }

    .field-discardPile {
        position: relative;

        .field-player & {
            width: $playerDiscardPileCardWidth;
            height: $playerDiscardPileCardHeight;
        }

        .field-opponent & {
            width: $opponentDiscardPileCardWidth;
            height: $opponentDiscardPileCardHeight;
        }

        .card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
        }
    }

    .discardPile-cardGhost::after {
        content: "";
        position: absolute;
        width: 170%;
        height: 170%;
        top: 50%;
        left: 20%;
        z-index: 10000;
        transform: translate(-50%, -50%);
    }

    .field-zone {
        flex: 1 0;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;

        .card {
            margin: 4px;
            box-sizing: border-box;
        }
    }

    .field-zoneRows {
        display: flex;
        flex-direction: column;

        &.field-opponentZoneRows {
            padding-top: 80px;
        }
    }

    .field-opponentCardsOnHand {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex: 1 0;
        justify-content: center;
        align-items: flex-start;

        .card {
            width: $opponentCardOnHandWidth;
            height: $opponentCardOnHandHeight;
            position: absolute;
            top: 0;
            transition: bottom .2s ease-out;

            &:last-child {
                margin-right: 0;
            }
        }
    }

    .field-playerCardsOnHand {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1 0;
    }

    .field-playerCardsOnHand .card {
        position: absolute;
        bottom: 0;
        transition: bottom .2s ease-out, width .2s ease-out, height .2s ease-out;
        box-sizing: content-box;

        &::after {
            content: "";
            width: 100%;
            height: 175%;
            position: absolute;
        }

        &::before {
            content: "";
            width: 100%;
            height: 100%;
            left: 0;
            bottom: 0;
            position: absolute;
        }

        &.card--hoverable:hover {
            position: absolute;
            bottom: 165px;
            left: -($playerCardWidth - $cardHoverWidth);
            width: $cardHoverWidth;
            height: $cardHoverHeight;
        }

        &--highlight {
            outline: 4px solid #8ae68a;

            &:hover {
                outline: 6px solid #2ee62e;
            }
        }
    }

    .card {
        width: $playerCardWidth;
        height: $playerCardHeight;
        display: flex;
        flex-direction: column;
        background: white;
        background-size: 100% 100%;
        box-sizing: border-box;

        &--placeholder {
            background: none;
            border-color: transparent;
        }

        &--turnedAround {
            transform: rotate(180deg);
        }
    }

    .card-faceDown {
        position: relative;
        overflow: hidden;
        background-color: transparent;

        &::before {
            content: "";
            position: absolute;
            top: -1px;
            left: -1px;
            right: -1px;
            bottom: -1px;
            background-image: url("/card/back/image");
            background-size: cover;

            .field-opponent & {
                transform: rotate(180deg);
            }

            .field-opponentCardsOnHand & {
                transform: rotate(180deg);
            }
        }

        &::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;

            .field-opponent & {
                background-color: rgba(53, 167, 255, .3);
            }

            .field-player & {
                background-color: rgba(255, 0, 0, 0.25);
            }
        }
    }

    .card-ghost {
        width: $playerCardWidth;
        height: $playerCardHeight;
        border: 4px solid #8ae68a;
        background: transparent;
    }

    .holdingCard {
        position: absolute;
    }

    .playerActionPointsContainer {
        position: absolute;
        top: -30px;
        left: 51%;
        transform: translateX(-50%);
    }

    .playerActionPoints {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: bold;
        font-family: Helvetica, sans-serif;
        color: black;
        border: 2px solid black;
        background-color: white;
        width: 60px;
        height: 60px;
        text-align: center;
        border-radius: 4px;
    }

    .field-playerHud {
        position: absolute;
        left: 0;
        bottom: 0;
    }

    .field-playerHudRow {
        height: 80px;
        box-sizing: border-box;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-left: 10px;
    }

    .playerHud-item {
        margin: 0 10px;
        padding: 10px 20px;
        font-size: 18px;
        font-family: Helvetica, sans-serif;
        font-weight: bold;

        &:first-child {
            margin-right: 0;
        }
    }

    .playerHud-phaseText {
        display: inline-block;
        background-color: #35A7FF;
        box-shadow: inset 0 1px 10px 1px rgba(0, 0, 0, 0.18);
        color: white;
    }

    .playerHud-button {
        box-shadow: 0 1px 6px 1px rgba(0, 0, 0, 0.2);;
        border: none;

        &:active {
            outline: 2px solid rgba(0, 0, 0, .3);
        }

        &:focus, &:hover {
            outline: 0;
        }
    }

    .playerHud-nextPhaseButton {
        background-color: #51c870;
        color: white;

        &:hover {
            background-color: #68cc88;
            outline: 0;
        }
    }

    .playerHud-endTurnButton {
        background-color: #ff3646;
        color: white;

        &:hover {
            background-color: #ff6670;
        }
    }

    .guideText {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 74px;
        font-family: Consolas, serif;
        width: 80vw;
        height: 30vh;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ff3336;
        text-decoration: underline;
        font-weight: bold;
        text-shadow: -1px 1px 10px rgba(255, 255, 255, 0.12),
        1px 1px 10px rgba(255, 255, 255, 0.12)
    }

    .actionOverlays, .indicatorOverlays {
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

        &:hover {
            & .actionOverlay {
                visibility: visible;
            }
        }
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
        opacity: .5;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }
    }

    .drawPile-draw {
        background-color: rgba(0, 0, 0, .5);
    }
</style>