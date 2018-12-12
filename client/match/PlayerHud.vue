<template>
    <div class="field-playerHud">
        <div class="field-playerHudRow">
            <template v-if="isOwnTurn">
                <button v-if="phase === 'start'"
                        @click="startClick"
                        class="playerHud-nextPhaseButton playerHud-button playerHud-item">
                    START
                </button>
                <template v-else-if="canGoToNextTurn">
                    <div class="playerHud-phaseText playerHud-item">{{ currentPhaseText }}</div>
                    <div v-if="phase === 'discard' && playerCardModels.length > maxHandSize"
                         class="playerHud-nextPhaseButton playerHud-phaseText playerHud-item">
                        Discard {{ amountOfCardsToDiscard + (amountOfCardsToDiscard > 1 ? ' cards' : ' card')}} to continue
                    </div>
                    <button v-else-if="nextPhaseButtonText"
                            @click="nextPhaseClick"
                            class="playerHud-nextPhaseButton playerHud-button playerHud-item">
                        {{ nextPhaseButtonText }}
                    </button>
                    <button v-else-if="shouldEndTurnButton"
                            @click="nextPhaseClick"
                            class="playerHud-endTurnButton playerHud-button playerHud-item">
                        End turn
                    </button>
                </template>
            </template>
            <div v-else class="playerHud-phaseText playerHud-item">Waiting for next player</div>
        </div>
        <portal to="match">
            <div v-if="numberOfStationCardsToSelect > 0" class="guideText">
                Select {{ numberOfStationCardsToSelect}}
                more station {{ numberOfStationCardsToSelect === 1 ? 'card' : 'cards' }}
            </div>
            <div v-if="phase === PHASES.preparation"
                 to="match"
                 class="guideText guideText--small guideText-discardDurationCards">
                Discard any duration card you don't want to pay for
            </div>
            <div v-if="phase === PHASES.draw" to="match" class="guideText guideText--small guideText-drawCard">
                Draw more cards
            </div>
        </portal>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const { PHASES } = require('./phases.js');

    module.exports = {
        computed: {
            ...mapState([
                'currentPlayer',
                'phase',
                'ownUser',
                'selectedDefendingStationCards'
            ]),
            ...mapGetters([
                'playerCardModels',
                'nextPhaseWithAction',
                'maxHandSize',
                'cardsToDrawInDrawPhase',
                'actionPoints2',
                'attackerCard',
                'amountOfCardsToDiscard',
                'queryEvents'
            ]),
            PHASES() {
                return PHASES;
            },
            isOwnTurn() {
                return this.ownUser.id === this.currentPlayer;
            },
            currentPhaseText() {
                if (this.phase === 'preparation') {
                    return 'Prepare for turn';
                }

                const nameOfCurrentPhase = this.phase.substr(0, 1).toUpperCase() + this.phase.substr(1);
                return `${nameOfCurrentPhase} phase`;
            },
            shouldEndTurnButton() {
                return !this.nextPhaseWithAction || this.nextPhaseWithAction === PHASES.wait;
            },
            nextPhaseButtonText() {
                if (this.shouldEndTurnButton) return '';
                if (this.phase === PHASES.wait) return '';
                if (this.phase === PHASES.preparation) {
                    return 'Start turn';
                }
                const cardDrawsOnTurn = this.queryEvents.getCardDrawsOnTurn(this.turn);
                const hasDrawnEnoughCards = cardDrawsOnTurn.length === this.cardsToDrawInDrawPhase
                if (this.phase === PHASES.draw && !hasDrawnEnoughCards) return '';

                return `${capitalize(this.nextPhaseWithAction)} phase`;
            },
            canGoToNextTurn() {
                return this.actionPoints2 >= 0;
            },
            numberOfStationCardsToSelect() {
                if (!this.attackerCard) return 0;
                if (this.selectedDefendingStationCards.length === 0) return 0;

                return this.attackerCard.attack - this.selectedDefendingStationCards.length;
            }
        },
        methods: {
            ...mapActions([
                'goToNextPhase',
            ]),
            startClick() {
                this.goToNextPhase();
            },
            nextPhaseClick() {
                this.goToNextPhase();
            }
        }
    };

    function capitalize(word) {
        return word.substr(0, 1).toUpperCase() + word.substr(1);
    }
</script>
<style scoped lang="scss">
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
        text-align: center;
        font-size: 74px;
        font-family: Consolas, serif;
        width: 65vw;
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

    .guideText--small {
        font-size: 64px;
    }
</style>