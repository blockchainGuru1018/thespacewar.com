<template>
    <div ref="match" class="match">
        <div class="match-header">
            <button @click="retreat" class="match-retreatButton">Retreat</button>
            <h1 :title="`Match ID: ${matchId}`">{{ ownUser.name }} v.s. {{ opponentUser.name }}</h1>
        </div>
        <div class="field">
            <div class="field-opponent">
                <div class="field-opponentStation field-station field-section">
                    <div class="field-stationRow">
                        <div v-for="card in opponentStation.drawCards" class="card card-faceDown"/>
                    </div>
                    <div class="field-stationRow">
                        <div v-for="card in opponentStation.actionCards" class="card card-faceDown"/>
                    </div>
                    <div class="field-stationRow">
                        <div v-for="card in opponentStation.handSizeCards" class="card card-faceDown"/>
                    </div>
                </div>
                <div class="field-zone field-section">
                    <template v-for="n in 6">
                        <zone-card v-if="n <= opponentCardsInZone.length"
                                   :card="opponentCardsInZone[n - 1]"
                                   :attackable="canAttackCardInOpponentZone"
                                   @attack="selectAsDefender"/>
                        <div v-else class="card card--placeholder"/>
                    </template>
                </div>
                <div class="field-zone field-section playerCardsInOpponentZone">
                    <template v-for="n in 6">
                        <zone-card v-if="n <= playerCardsInOpponentZone.length"
                                   :card="playerCardsInOpponentZone[n - 1]"
                                   :readyToAttack="canAttackThisTurn(playerCardsInOpponentZone[n - 1])"
                                   :selectedAsAttacker="attackerCardId === playerCardsInOpponentZone[n - 1].id"
                                   @readyToAttack="selectAsAttacker"/>
                        <div v-else class="card card--placeholder"/>
                    </template>
                </div>
                <div class="field-piles field-section">
                    <div class="field-discardPile">
                        <div v-if="opponentDiscardedCards.length === 0"
                             class="card card--placeholder"/>
                        <div v-else
                             :style="getCardImageStyle(opponentTopDiscardCard)"
                             class="card card--turnedAround"/>
                    </div>
                    <div class="field-drawPile">
                        <div class="card card-faceDown"/>
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
                    <div class="playerActionPointsContainer">
                        <div class="playerActionPoints">
                            {{ playerActionPointsText }}
                        </div>
                    </div>
                    <div class="field-drawPile">
                        <div class="card card-faceDown"/>
                    </div>
                    <div class="field-discardPile">
                        <div v-if="playerDiscardedCards.length === 0" class="card card--placeholder"/>
                        <div v-else
                             :style="getCardImageStyle(playerTopDiscardCard)"
                             class="card"/>
                        <div v-if="discardPileCardGhostVisible"
                             @click="cardGhostClick('discard')"
                             class="card card-ghost"/>
                    </div>
                </div>
                <div class="field-playerZoneCards field-zone field-section">
                    <template v-for="n in 6">
                        <zone-card v-if="n <= playerCardsInZone.length"
                                   :card="(playerCardsInZone[n - 1])"
                                   :movable="phase === 'attack'"
                                   :readyToAttack="canAttackThisTurn(playerCardsInZone[n - 1])"
                                   :selectedAsAttacker="attackerCardId === playerCardsInZone[n - 1].id"
                                   @move="moveCard"
                                   @readyToAttack="selectAsAttacker"/>
                        <div v-else-if="playerZoneCardGhostVisible"
                             @click="cardGhostClick('zone')"
                             class="card card-ghost"/>
                        <div v-else class="card card--placeholder"/>
                    </template>
                </div>
                <div class="field-zone field-section">
                    <template v-for="n in 6">
                        <zone-card v-if="n <= opponentCardsInPlayerZone.length"
                                   :card="opponentCardsInPlayerZone[n - 1]"
                                   :attackable="canAttackCardInHomeZone"
                                   @attack="selectAsDefender"/>
                        <div v-else class="card card--placeholder"/>
                    </template>
                </div>
                <div class="field-playerStation field-station field-section">
                    <div class="field-stationRow">
                        <div v-for="card in playerStation.drawCards" class="card card-faceDown"/>
                        <div v-if="stationCardGhostVisible"
                             @click="cardGhostClick('station-draw')"
                             class="card card-ghost"/>
                        <div v-else class="card card--placeholder"/>
                    </div>
                    <div class="field-stationRow">
                        <div v-for="card in playerStation.actionCards" class="card card-faceDown"/>
                        <div v-if="stationCardGhostVisible"
                             @click="cardGhostClick('station-action')"
                             class="card card-ghost"/>
                        <div v-else class="card card--placeholder"/>
                    </div>
                    <div class="field-stationRow">
                        <div v-for="card in playerStation.handSizeCards" class="card card-faceDown"/>
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
                <div class="field-playerHud">
                    <div class="field-playerHudRow">
                        <template v-if="isOwnTurn">
                            <button v-if="phase === 'start'"
                                    @click="startClick"
                                    class="playerHud-nextPhaseButton playerHud-button playerHud-item">
                                START
                            </button>
                            <template v-else>
                                <div class="playerHud-phaseText playerHud-item">{{ phaseText }} phase</div>
                                <div v-if="phase === 'discard' && playerCardModels.length > maxHandSize"
                                     class="playerHud-nextPhaseButton playerHud-phaseText playerHud-item">
                                    Discard {{ amountOfCardsToDiscard + (amountOfCardsToDiscard > 1 ? ' cards' : ' card')}} to continue
                                </div>
                                <button v-else-if="nextPhaseButtonText"
                                        @click="nextPhaseClick"
                                        class="playerHud-nextPhaseButton playerHud-button playerHud-item">
                                    {{ nextPhaseButtonText }} phase
                                </button>
                                <button v-else
                                        @click="nextPhaseClick"
                                        class="playerHud-endTurnButton playerHud-button playerHud-item">
                                    End turn
                                </button>
                            </template>
                        </template>
                        <div v-else class="playerHud-phaseText playerHud-item">Waiting for next player</div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="holdingCard" class="card holdingCard" :style="holdingCardStyle"/>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const ZoneCard = require('./ZoneCard.vue').default;
    const AttackEvent = require('../../shared/event/AttackEvent.js');

    module.exports = {
        data() {
            return {
                holdingCard: null,
                mousePosition: { x: 0, y: 0 }
            }
        },
        computed: {
            ...mapState([
                'matchId',
                'turn',
                'currentPlayer',
                'events',
                'phase',
                'actionPoints',
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
                'opponentCardsInPlayerZone',
                'attackerCardId'
            ]),
            ...mapGetters([
                'playerCardModels',
                'nextPhaseButtonText',
                'maxHandSize',
                'hasPutDownNonFreeCardThisTurn',
                'actionPoints2'
            ]),
            isOwnTurn() {
                return this.ownUser.id === this.currentPlayer;
            },
            phaseText() {
                return this.phase.substr(0, 1).toUpperCase() + this.phase.substr(1);
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
            amountOfCardsToDiscard() {
                return this.playerCardModels.length - this.maxHandSize;
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
            canAttack() {
                return this.phase === 'attack'
                    && !this.attackerCardId;
            },
            canAttackCardInOpponentZone() {
                return !!this.attackerCardId
                    && this.playerCardsInOpponentZone.some(c => c.id === this.attackerCardId);
            },
            canAttackCardInHomeZone() {
                return !!this.attackerCardId
                    && this.playerCardsInZone.some(c => c.id === this.attackerCardId);
            },
            playerActionPointsText() {
                if (this.calculatedActionPointsForActionPhaseVisible) {
                    return `Actions ${ this.actionPoints2 }`;
                }
                else {
                    return `Actions 0 (${this.actionPoints2})`
                }
            }
        },
        methods: {
            ...mapActions([
                'init',
                'putDownCard',
                'discardCard',
                'nextPhase',
                'moveCard',
                'selectAsAttacker',
                'selectAsDefender',
                'retreat'
            ]),
            startClick() {
                this.nextPhase();
            },
            canAffordCard(card) {
                return this.actionPoints >= card.cost;
            },
            canAttackThisTurn(card) {
                return this.canAttack
                    && !AttackEvent.cardHasAlreadyAttackedThisTurn(this.turn, card.commonId, this.events);
            },
            nextPhaseClick() {
                this.nextPhase();
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
                const targetElementClasses = Array.from(event.target.classList)
                if (!targetElementClasses.includes('card') || targetElementClasses.includes('card--placeholder')) {
                    this.emptyClick();
                }
            });
        },
        components: {
            ZoneCard
        }
    };
</script>
<style scoped lang="scss">
    $cardWidth: 652px;
    $cardHeight: 916px;
    $opponentCardWidth: calc(#{$cardWidth} / 12);
    $opponentCardHeight: calc(#{$cardHeight} / 12);
    $playerCardWidth: calc(#{$cardWidth} / 5);
    $playerCardHeight: calc(#{$cardHeight} / 5);

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
        left: 14px;
        top: 0;
        display: flex;
        align-items: center;
        z-index: 3;
        font-family: Helvetica, sans-serif;
        color: #333;
    }

    .match-retreatButton {
        background-color: #ff3646;
        color: rgba(255, 255, 255, 1);
        box-shadow: 0 1px 6px 1px rgba(0, 0, 0, 0.2);;
        border: none;
        font-size: 14px;
        padding: 3px 7px;
        margin-right: 16px;

        &:active {
            outline: 2px solid rgba(0, 0, 0, .3);
        }

        &:focus, &:hover {
            background-color: #ff6670;
            outline: 0;
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
        .card-faceDown {
            border-color: #E63946;
            background-color: #FF5964;
        }
    }

    .field-opponent {
        flex: 0 0 30%;

        .card {
            width: $opponentCardWidth;
            height: $opponentCardHeight;
        }

        .card-faceDown {
            background-color: #35A7FF;
            border-color: #38618C;
        }
    }

    .field-playerStation {
        flex-direction: column;
        margin-right: 8px;

        .card {
            width: $playerCardWidth;
            height: $playerCardHeight;

            margin-right: 8px;

            &:last-child {
                margin-right: 0;
            }
        }
    }

    .field-opponentStation {
        flex-direction: column;
    }

    .field-opponentStation .field-stationRow {
        flex-direction: row-reverse;

        .card {
            width: $opponentCardWidth;
            height: $opponentCardHeight;
            margin-left: 8px;

            &:last-child {
                margin-left: 0;
            }
        }
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

    }

    .field-discardPile {
        position: relative;

        .field-player & {
            width: $playerCardWidth;
            height: $playerCardHeight;
        }

        .field-opponent & {
            width: $opponentCardWidth;
            height: $opponentCardHeight;
        }

        .card {
            position: absolute;
            left: 0;
            top: 0;
        }
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

    .field-opponentCardsOnHand {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex: 1 0;
        justify-content: center;
        align-items: flex-start;
    }

    .field-opponentCardsOnHand .card {
        width: $opponentCardWidth;
        height: $opponentCardHeight;
        position: absolute;
        top: 0;
        transition: bottom .2s ease-out;

        &:last-child {
            margin-right: 0;
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
        border-width: 3px;
        border-style: solid;
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
        right: 12px;
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
</style>