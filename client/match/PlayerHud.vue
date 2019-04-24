<template>
    <div class="field-playerHud">

        <!-- THIS IS A TEST 2019-04-24 -->

        <portal to="player-top" v-if="!gameHasEnded">
            <div class="nextPhaseButtonContainer">
                <button v-if="phase === 'start'"
                    @click="startClick"
                    class="playerHud-phaseText nextPhaseButton">
                    Start
                </button>
                <template v-else-if="canGoToNextTurn">
                    <button class="playerHud-phaseText nextPhaseButton"
                        @click="nextPhaseClick"
                        v-if="nextPhaseButtonText">
                        {{ nextPhaseButtonText }}
                    </button>
                    <button v-else-if="endTurnButtonVisible"
                        @click="nextPhaseClick"
                        class="playerHud-phaseText nextPhaseButton nextPhaseButton-endTurn">
                        End turn
                    </button>
                </template>
            </div>

            <div class="guideTextContainer">
                <div class="guideText-waitingForOtherPlayer guideText guideText--small"
                    v-if="waitingForOtherPlayerToFinishRequirements">
                    <template v-if="waitingRequirement.reason === 'emptyDeck'">
                        Your opponent is dealing damage to your station
                    </template>
                    <template v-else>
                        Waiting for other player...
                    </template>
                </div>
                <div class="guideText guideText--small" v-else-if="actionGuideText">
                    <div :style="cardStyle"
                        @click="showEnlargedCard"
                        class="guideTextCardWrapper card">
                        <div class="enlargeIcon enlargeIcon--small"/>
                    </div>
                    {{ actionGuideText }}
                </div>
                <div class="guideText guideText--small"
                    v-else-if="requirementGuideText">
                    <div :style="cardStyle"
                        @click="showEnlargedCard"
                        class="guideTextCardWrapper card">
                        <div class="enlargeIcon enlargeIcon--small"/>
                    </div>
                    {{ requirementGuideText }}
                </div>
                <div class="guideText" v-else-if="numberOfStationCardsToSelect > 0">
                    Select {{ numberOfStationCardsToSelect }}
                    more station {{ numberOfStationCardsToSelect === 1 ? 'card' : 'cards' }}
                </div>
                <div v-else-if="phase === PHASES.preparation"
                    class="guideText-discardDurationCards guideText guideText--small">
                    Discard any duration card you don't want to pay for
                </div>
                <div class="guideText-drawCard guideText guideText--small" v-else-if="phase === PHASES.draw">
                    {{ composeDrawOrMillText() }}
                </div>
                <div v-else-if="inDiscardPhaseAndMustDiscardCard"
                    class="guideText-drawCard guideText guideText--small">
                    Discard {{ amountOfCardsToDiscard + (amountOfCardsToDiscard === 1 ? ' card' : ' cards')}} to
                    continue
                </div>
                <template v-else-if="showActionPoints">
                    <div class="playerActionPoints">
                        {{ playerActionPointsText }}
                    </div>
                </template>
                <div class="guideText" v-else-if="phase === PHASES.wait">
                    Enemy turn
                </div>
            </div>

            <div class="overworkContainer">
                <button v-if="canIssueOverwork"
                    @click="overwork"
                    title="Your opponent may flip 1 of your station cards & you receive 2 action points"
                    class="overwork darkButton">
                    Overwork
                </button>
            </div>
        </portal>
        <portal to="match">
            <div class="endGameOverlay" v-if="gameHasEnded">
                <div class="defeatText endGameText" v-if="hasLostGame">
                    DEFEAT
                </div>
                <div class="victoryText endGameText" v-else-if="hasWonGame">
                    VICTORY
                </div>
                <button @click="endGame" class="endGameButton">
                    End game
                </button>
            </div>
        </portal>
        <portal to="stationDrawRow">
            <span class="stationRowDescription descriptionText">
                Draw {{ cardsToDrawInDrawPhase }} card{{cardsToDrawInDrawPhase === 1 ? '' : 's'}} each turn
            </span>
        </portal>
        <portal to="stationActionRow">
            <span class="stationRowDescription descriptionText">
                Start turn with {{ actionPointsFromStationCards }} action point{{actionPointsFromStationCards === 1 ? '' : 's'}}
            </span>
        </portal>
        <portal to="stationHandSizeRow">
            <span class="stationRowDescription descriptionText">
                Max {{ maxHandSize }} card{{maxHandSize === 1 ? '' : 's'}} on hand
            </span>
        </portal>
        <portal to="playerDrawPile">
            <span v-if="canDrawCards" class="playerDrawPileDescription descriptionText">
                Click to draw
            </span>
        </portal>
        <portal to="opponentDrawPile">
            <span v-if="canMill" class="opponentDrawPileDescription descriptionText">
                Click to mill 2 cards
            </span>
        </portal>
        <portal to="match" v-if="enlargedCardVisible">
            <div class="dimOverlay"/>
            <div class="card card--enlarged"
                :style="cardStyle"
                v-click-outside="hideEnlargedCard"/>
        </portal>
        <portal to="match" v-if="firstRequirementIsFindCard">
            <FindCard/>
        </portal>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const resolveModuleWithPossibleDefault = require('../../client/utils/resolveModuleWithPossibleDefault.js');
    const FindCard = resolveModuleWithPossibleDefault(require('./FindCard.vue'));
    const getCardImageUrl = require('../utils/getCardImageUrl.js');
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
                'waitingRequirement',
                'firstRequirement',
                'firstRequirementIsDiscardCard',
                'firstRequirementIsDamageStationCard',
                'firstRequirementIsDrawCard',
                'firstRequirementIsFindCard',
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
                'canMill',
                'canIssueOverwork'
            ]),
            showActionPoints() {
                return ['action'].includes(this.phase);
            },
            playerActionPointsText() {
                return `${this.actionPoints2} action ${pluralize('point', this.actionPoints2)} remaining`;
            },
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
            endTurnButtonVisible() {
                return !this.nextPhaseWithAction || this.nextPhaseWithAction === PHASES.wait;
            },
            nextPhaseButtonText() {
                if (this.endTurnButtonVisible) return '';
                if (this.phase === PHASES.wait) return '';
                if (this.phase === PHASES.preparation) {
                    return 'Start turn';
                }
                const cardDrawsOnTurn = this.queryEvents.getCardDrawsOnTurn(this.turn);
                const hasDrawnEnoughCards = cardDrawsOnTurn.length === this.cardsToDrawInDrawPhase;
                if (this.phase === PHASES.draw && !hasDrawnEnoughCards) return '';

                return `Go to ${(this.nextPhaseWithAction)} phase`;
            },
            inDiscardPhaseAndMustDiscardCard() {
                return this.phase === PHASES.discard && this.playerCardsOnHand.length > this.maxHandSize;
            },
            canGoToNextTurn() {
                return this.actionPoints2 >= 0
                    && !this.firstRequirement
                    && !this.inDiscardPhaseAndMustDiscardCard
                    && this.phase !== PHASES.wait;
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
                else if (this.firstRequirementIsDamageStationCard && this.cardsLeftToSelect > 0) {
                    return `Select ${this.cardsLeftToSelect} station ${pluralize('card',
                        this.cardsLeftToSelect)} to damage`;
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
                    return {
                        display: 'none'
                    };
                }
            }
        },
        methods: {
            ...mapActions([
                'goToNextPhase',
                'endGame',
                'overwork'
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
        },
        components: {
            FindCard
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
        padding: 10px 20px;
        font-size: 18px;
        font-family: Helvetica, sans-serif;
        font-weight: bold;

        &:first-child {
            margin-right: 0;
        }
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

    .nextPhaseButtonContainer {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        z-index: 1;
        width: 15%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .nextPhaseButton {
        width: 70%;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 46px;
        font-size: 16px;
        font-family: Helvetica, sans-serif;
        font-weight: bold;
        color: white;
        background-color: rgba(0, 0, 0, .8);
        border-left: 1px solid white;
        border-top: 1px solid white;
        border-right: 1px solid white;
        border-bottom: 1px solid white;
        user-select: none;

        &:hover {
            background-color: #51c870;
            color: white;
            outline: 0;
        }
    }

    .nextPhaseButton-wait {
        color: #AAA;
        background: rgba(0, 0, 0, .8);
        pointer-events: none;
    }

    .nextPhaseButton-endTurn {
        &:hover {
            background-color: #ff3646;
            color: white;
        }
    }

    .overworkContainer {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        z-index: 1;
        width: 15%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .descriptionText {
        font-family: sans-serif;
        font-weight: bold;
        color: rgba(180, 180, 180, 0.5);
    }

    .stationRowDescription {
        position: absolute;
        left: 0;
        display: flex;
        text-align: right;
        justify-content: flex-end;
        align-items: center;
        top: 0;
        z-index: 1;
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
        z-index: 2;
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
