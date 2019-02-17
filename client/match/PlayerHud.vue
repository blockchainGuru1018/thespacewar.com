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
                    <div v-if="phase === 'discard' && playerCardsOnHand.length > maxHandSize"
                         class="playerHud-nextPhaseButton playerHud-phaseText playerHud-item">
                        Discard {{ amountOfCardsToDiscard + (amountOfCardsToDiscard === 1 ? ' card' : ' cards')}} to
                        continue
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
            <div v-if="gameHasEnded" class="endGameOverlay">
                <div v-if="hasLostGame" class="defeatText endGameText">
                    DEFEAT
                </div>
                <div v-else-if="hasWonGame" class="victoryText endGameText">
                    VICTORY
                </div>
                <button @click="endGame" class="endGameButton">
                    End game
                </button>
            </div>
            <div v-else-if="waitingForOtherPlayerToFinishRequirements"
                 class="guideText-waitingForOtherPlayer guideText guideText--small">
                Waiting for other player...
            </div>
            <div v-else-if="actionGuideText" class="guideText guideText--small">
                <div @click="showEnlargedCard"
                     :style="cardStyle"
                     class="guideTextCardWrapper card">
                    <div class="enlargeIcon enlargeIcon--small"/>
                </div>
                {{ actionGuideText }}
            </div>
            <div v-else-if="requirementGuideText"
                 class="guideText guideText--small">
                <div @click="showEnlargedCard"
                     :style="cardStyle"
                     class="guideTextCardWrapper card">
                    <div class="enlargeIcon enlargeIcon--small"/>
                </div>
                {{ requirementGuideText }}
            </div>
            <div v-else-if="numberOfStationCardsToSelect > 0" class="guideText">
                Select {{ numberOfStationCardsToSelect}}
                more station {{ numberOfStationCardsToSelect === 1 ? 'card' : 'cards' }}
            </div>
            <div v-else-if="phase === PHASES.preparation"
                 class="guideText-discardDurationCards guideText guideText--small">
                Discard any duration card you don't want to pay for
            </div>
            <div v-else-if="phase === PHASES.draw" class="guideText-drawCard guideText guideText--small">
                Draw card or Mill opponent
            </div>
        </portal>
        <portal to="stationDrawRow">
            <span class="stationRowDescription descriptionText">
                Draw {{ cardsToDrawInDrawPhase }} card{{cardsToDrawInDrawPhase === 1 ? '' : 's'}} each turn
            </span>
        </portal>
        <portal to="stationActionRow">
            <span class="stationRowDescription descriptionText">
                Gives {{ actionPointsFromStationCards }} action point{{actionPointsFromStationCards === 1 ? '' : 's'}}
            </span>
        </portal>
        <portal to="stationHandSizeRow">
            <span class="stationRowDescription descriptionText">
                Max {{ maxHandSize }} card{{maxHandSize === 1 ? '' : 's'}} on hand
            </span>
        </portal>
        <portal to="playerDrawPile">
            <span v-if="canDrawCards" class="playerDrawPileDescription descriptionText">
                Click on draw pile to draw a card
            </span>
        </portal>
        <portal to="opponentDrawPile">
            <span v-if="canMill" class="opponentDrawPileDescription descriptionText">
                Click on draw pile to mill 2 cards
            </span>
        </portal>
        <portal to="match" v-if="enlargedCardVisible">
            <div class="dimOverlay"/>
            <div class="card card--enlarged"
                 :style="cardStyle"
                 v-click-outside="hideEnlargedCard"/>
        </portal>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const {
        mapState: mapRequirementState,
        mapGetters: mapRequirementGetters,
        mapMutations: mapRequirementMutations,
        mapActions: mapRequirementActions
    } = Vuex.createNamespacedHelpers('requirement');
    const {
        mapState: mapCardState,
        mapGetters: mapCardGetters,
        mapMutations: mapCardMutations,
        mapActions: mapCardActions
    } = Vuex.createNamespacedHelpers('card');
    const {
        mapState: mapPermissionState,
        mapGetters: mapPermissionGetters,
        mapMutations: mapPermissionMutations,
        mapActions: mapPermissionActions
    } = Vuex.createNamespacedHelpers('permission');
    const { PHASES } = require('./phases.js');

    module.exports = {
        data() {
            return {
                enlargedCardVisible: false
            };
        },
        computed: {
            ...mapState([
                'currentPlayer',
                'phase',
                'ownUser',
                'selectedDefendingStationCards',
                'requirements',
                'playerCardsOnHand'
            ]),
            ...mapGetters([
                'nextPhaseWithAction',
                'cardsToDrawInDrawPhase',
                'actionPointsFromStationCards',
                'maxHandSize',
                'actionPoints2',
                'attackerCard',
                'amountOfCardsToDiscard',
                'queryEvents',
                'allOpponentStationCards',
                'allPlayerStationCards'
            ]),
            ...mapRequirementGetters([
                'waitingForOtherPlayerToFinishRequirements',
                'firstRequirement',
                'firstRequirementIsDiscardCard',
                'firstRequirementIsDamageOwnStationCard',
                'firstRequirementIsDrawCard',
                'cardsLeftToSelect',
                'selectedCardsCount',
                'countInFirstRequirement',
                'requirementCardImageUrl'
            ]),
            ...mapCardState([
                'activeAction',
            ]),
            ...mapCardGetters([
                'activeActionCardImageUrl'
            ]),
            ...mapPermissionGetters([
                'canDrawCards',
                'canMill'
            ]),
            gameHasEnded() {
                return this.hasWonGame || this.hasLostGame;
            },
            hasWonGame() {
                return this.allOpponentStationCards.filter(s => !s.flipped).length === 0;
            },
            hasLostGame() {
                return this.allPlayerStationCards.filter(s => !s.flipped).length === 0;
            },
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
                return this.actionPoints2 >= 0
                    && !this.firstRequirement;
            },
            numberOfStationCardsToSelect() {
                if (!this.attackerCard) return 0;
                if (this.selectedDefendingStationCards.length === 0) return 0;

                return this.attackerCard.attack - this.selectedDefendingStationCards.length;
            },
            requirementGuideText() {
                if (this.firstRequirementIsDiscardCard) {
                    const cardsToDiscard = this.countInFirstRequirement;
                    return `Discard ${cardsToDiscard} ${pluralize('card', cardsToDiscard)}`;
                }
                else if (this.firstRequirementIsDamageOwnStationCard && this.cardsLeftToSelect > 0) {
                    return `Select ${this.cardsLeftToSelect} of your own station cards to damage`;
                }
                else if (this.firstRequirementIsDrawCard) {
                    return this.composeDrawOrMillText();
                }
                else {
                    return '';
                }
            },
            actionGuideText() {
                if (!this.activeAction) return '';
                if (this.activeAction.text) {
                    return this.activeAction.text;
                }
                return '';
            },
            cardStyle() {
                if (this.activeActionCardImageUrl) {
                    return {
                        backgroundImage: `url(${this.activeActionCardImageUrl})`
                    };
                }
                else if (this.requirementCardImageUrl) {
                    return {
                        backgroundImage: `url(${this.requirementCardImageUrl})`
                    };
                }
                else {
                    return {};
                }
            }
        },
        methods: {
            ...mapActions([
                'goToNextPhase',
                'endGame'
            ]),
            startClick() {
                this.goToNextPhase();
            },
            nextPhaseClick() {
                this.goToNextPhase();
            },
            showEnlargedCard() {
                this.enlargedCardVisible = true;
            },
            hideEnlargedCard() {
                this.enlargedCardVisible = false;
            },
            composeDrawOrMillText() {
                return 'Draw card or Mill opponent';
            }
        }
    };

    function pluralize(word, count) {
        return count === 1 ? word : word + 's';
    }

    function capitalize(word) {
        return word.substr(0, 1).toUpperCase() + word.substr(1);
    }
</script>
<style scoped lang="scss">
    @import "card";
    @import "enlargeCard";

    $overlayColor: rgba(0, 0, 0, .4);

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
        font-family: "Space Mono", monospace;
        width: 65vw;
        height: 30vh;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        user-select: none;
    }

    .guideText--small {
        font-size: 64px;
    }

    .descriptionText {
        font-family: sans-serif;
        font-weight: bold;
        color: #AAA;
    }

    .stationRowDescription {
        position: absolute;
        left: 0;
        transform: translate(-100%, 0);
        display: flex;
        text-align: right;
        justify-content: flex-end;
        align-items: center;
        width: 220px;
        height: 100%;
        padding: 0 10px;
    }

    .opponentDrawPileDescription,
    .playerDrawPileDescription {
        position: absolute;
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0 10px;
        font-size: 20px;
    }

    .opponentDrawPileDescription {
        position: absolute;
        left: 100%;
        justify-content: flex-end;
        width: 120px;
    }

    .playerDrawPileDescription {
        position: absolute;
        left: 100%;
        width: 180px;
    }

    .match:not(.currentPhase--draw) {
        .playerDrawPileDescription, .opponentDrawPileDescription {
            display: none;
        }
    }

    .endGameOverlay {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: $overlayColor;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .endGameText {
        font-size: 128px;
        font-family: sans-serif;
        font-weight: bold;
        letter-spacing: .2em;
    }

    .victoryText {
        color: #66fa8b;
    }

    .defeatText {
        color: #ff3646;
    }

    .endGameButton {
        margin-top: 100px;
        background-color: #ff3646;
        color: white;
        font-size: 32px;
        padding: 8px 15px;
        box-shadow: 0 1px 6px 1px rgba(0, 0, 0, 0.2);;
        border: none;

        &:hover {
            background-color: #ff6670;
        }
    }

    .guideTextCardWrapper {
        width: $cardWidth * .1;
        height: $cardHeight * .1;
        position: relative;
        top: 4px;
        margin-right: 15px;
        flex: 0 0 auto;
    }

    .guideTextCard {
        width: 100%;
        height: 100%;
    }
</style>