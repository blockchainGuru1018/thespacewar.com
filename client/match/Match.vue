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
                <div class="field-opponentCardsOnHand field-section">
                    <div
                            v-for="n in opponentCardCount"
                            :style="getOpponentCardStyle(n - 1)"
                            class="card card-faceDown"/>
                </div>
                <div class="field-piles field-section">
                </div>
            </div>
            <div class="field-player">
                <div class="field-piles field-section">
                </div>
                <div class="field-playerCardsOnHand field-section">
                    <div
                            v-for="card, index in playerCardModels"
                            v-if="card !== holdingCard"
                            :style="getCardStyle(card, index)"
                            :class="getPlayerCardClasses(card)"
                            @click="playerCardClick(card)"/>
                </div>
                <div class="field-playerStation field-station field-section">
                    <div class="field-stationRow">
                        <div v-for="card in playerStation.drawCards" class="card card-faceDown"/>
                        <div v-if="holdingCard" @click="cardGhostClick('station-draw')" class="card card-ghost"/>
                    </div>
                    <div class="field-stationRow">
                        <div v-for="card in playerStation.actionCards" class="card card-faceDown"/>
                        <div v-if="holdingCard" @click="cardGhostClick('station-action')" class="card card-ghost"/>
                    </div>
                    <div class="field-stationRow">
                        <div v-for="card in playerStation.handSizeCards" class="card card-faceDown"/>
                        <div v-if="holdingCard" @click="cardGhostClick('station-handSize')" class="card card-ghost"/>
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
                'phase',
                'actionPoints',
                'opponentUser',
                'ownUser',
                'playerCardsOnHand',
                'playerStation',
                'opponentStation',
                'opponentCardCount',
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
            }
        },
        methods: {
            ...mapActions([
                'init',
                'putDownCard'
            ]),
            playerCardClick(card) {
                if (this.actionPoints >= card.cost) {
                    this.holdingCard = card;
                }
            },
            cardGhostClick(location) {
                this.putDownCard({ location, cardId: this.holdingCard.id });
                this.holdingCard = null;
            },
            emptyClick() {
                if (this.holdingCard) {
                    this.holdingCard = null;
                }
            },
            getOpponentCardStyle(index) {
                const cardCount = this.playerCardsOnHand.length;
                const turnDistance = 2;
                const startDegrees = -((cardCount - 1) * turnDistance * .5);
                let degrees = index * turnDistance;
                return {
                    transform: 'rotate(' + ((startDegrees + degrees)) + 'deg)',
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
            getCardStyle(card, index) {
                const cardCount = this.playerCardsOnHand.length;
                const turnDistance = 1.5;
                const startDegrees = -((cardCount - 1) * turnDistance * .5);
                let degrees = index * turnDistance;
                return {
                    transform: 'rotate(' + (startDegrees + degrees) + 'deg)',
                    transformOrigin: 'center 1600%',
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
                if (!targetElementClasses.includes('card')) {
                    this.emptyClick();
                }
            });
        }
    };
</script>
<style scoped lang="scss">
    $cardWidth: 652px;
    $cardHeight: 916px;
    $opponentCardWidth: calc(#{$cardWidth} / 10);
    $opponentCardHeight: calc(#{$cardHeight} / 10);
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

    .field .field-section:first-child {
        border-right: 2px dashed rgba(0, 0, 0, .12);
        padding-right: 20px;
        margin-right: 20px;
    }

    .field .field-section:last-child {
        border-left: 2px dashed rgba(0, 0, 0, .12);
        padding-left: 20px;
        margin-left: 20px;
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

    .field-opponent {
        flex: 0 0 30%;
    }

    .field-station {
        display: flex;
        flex: 0 0 20%;
    }

    .field-playerStation {
        flex-direction: column-reverse;
    }

    .field-playerStation .field-stationRow {
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

    .field-stationRow {
        display: flex;
        margin-bottom: 10px;
    }

    .field-piles {
        flex: 0 0 10%;
    }

    .field-drawPile {

    }

    .field-discardPile {

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

        &::after {
            content: "";
            width: 100%;
            height: 175%;
            position: absolute;
            /*left: 50%;*/
            /*right: 50%;*/
            //transform: translateY(-50%);
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
            border: 2px solid #000000;
            outline: 4px solid #8ae68a;

            &:hover {
                outline: 6px solid #2ee62e;
            }
        }
    }

    .card {
        width: $playerCardWidth;
        height: $playerCardHeight;
        border: 3px solid #96965a;
        display: flex;
        flex-direction: column;
        background: white;
        background-size: 100% 100%;
    }

    .card-faceDown {
        background: #4e4e2e;
    }

    .card-ghost {
        width: $playerCardWidth;
        height: $playerCardHeight;
        outline: 4px solid #8ae68a;
        background: white;
    }

    .holdingCard {
        position: absolute;
    }
</style>