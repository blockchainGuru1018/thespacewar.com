<template>
    <div ref="match" class="match">
        <h1>{{ ownUser.name }} V.S. {{ opponentUser.name }}</h1>
        <div>
            <span>Match ID: {{ matchId }}</span>
            <span>Phase: {{ phase }}</span>
            <span>Actions: {{ actionPoints }}</span>
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
                </div>
                <div class="field-piles field-section">
                    <div class="field-drawPile">
                        <div class="card card-faceDown"/>
                    </div>
                    <div class="field-discardPile">
                        <div v-if="opponentDiscardedCards.length === 0"
                             class="card card--placeholder"/>
                        <div v-else
                             :style="getCardImageStyle(opponentTopDiscardCard)"
                             class="card card--turnedAround"/>
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
                    <div class="field-drawPile">
                        <div class="card card-faceDown"/>
                    </div>
                    <div class="field-discardPile">
                        <div v-if="playerDiscardedCards.length === 0" class="card card--placeholder"/>
                        <div v-else
                             :style="getCardImageStyle(playerTopDiscardCard)"
                             class="card"/>
                        <div v-if="holdingCard" @click="cardGhostClick('discard')" class="card card-ghost"/>
                    </div>
                </div>
                <div class="field-zone field-section">
                    <template v-for="n in 6">
                        <div v-if="n <= playerCardsInZone.length"
                             class="card"
                             :style="getCardInZoneStyle(playerCardsInZone[n - 1])"/>
                        <div v-else-if="playerZoneCardGhostVisible"
                             @click="cardGhostClick('zone')"
                             class="card card-ghost"/>
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
            </div>
        </div>
        <div v-if="holdingCard" class="card holdingCard" :style="holdingCardStyle"/>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');

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
                'opponentDiscardedCards'
            ]),
            ...mapGetters([
                'playerCardModels'
            ]),
            holdingCardStyle() {
                if (!this.holdingCard) return {};

                return {
                    left: this.mousePosition.x + 'px',
                    top: this.mousePosition.y + 'px',
                    backgroundImage: 'url(/card/' + this.holdingCard.id + '/image)',
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
            stationCardGhostVisible() {
                const hasAlreadyPutDownStationCard = !this.events.some(e => {
                    return e.turn === this.turn
                        && e.type === 'putDownCard'
                        && e.location.startsWith('station');
                })
                return this.holdingCard && hasAlreadyPutDownStationCard;
            },
            canPlaceCards() {
                return this.phase === 'action'
                    && this.currentPlayer === this.ownUser.id;
            }
        },
        methods: {
            ...mapActions([
                'init',
                'putDownCard',
                'discardCard'
            ]),
            canAffordCard(card) {
                return this.actionPoints >= card.cost;
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
                    backgroundImage: 'url(/card/' + card.id + '/image)'
                }
            },
            getCardInZoneStyle(card) {
                return {
                    ...this.getCardImageStyle(card)
                }
            },
            getCardImageStyle(card) {
                return {
                    backgroundImage: 'url(/card/' + card.id + '/image)'
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
        flex-direction: column-reverse;
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
</style>