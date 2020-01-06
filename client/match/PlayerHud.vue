<template>
    <div class="field-playerHud">
        <portal
            v-if="!gameHasEnded"
            to="player-top"
        >
            <div
                v-if="startGameButtonContainerVisible"
                class="startGameButtonContainer"
            >
                <button
                    v-if="readyButtonVisible"
                    class="readyButton playerHud-phaseText nextPhaseButton"
                    @click="readyClick"
                >
                    Ready
                </button>
            </div>
            <div
                v-else-if="nextPhaseButtonContainerVisible"
                class="nextPhaseButtonContainer"
            >
                <template v-if="canGoToNextTurn">
                    <button
                        v-if="nextPhaseButtonText"
                        class="playerHud-phaseText nextPhaseButton"
                        @click="nextPhaseClick"
                    >
                        {{ nextPhaseButtonText }}
                    </button>
                    <button
                        v-else-if="endTurnButtonVisible"
                        class="playerHud-phaseText nextPhaseButton nextPhaseButton-endTurn"
                        @click="nextPhaseClick"
                    >
                        End turn
                    </button>
                </template>
            </div>

            <GuideText @showEnlargedCard="showEnlargedCard" />

            <div
                v-if="overworkContainerVisible || perfectPlanContainerVisible"
                class="overworkContainer"
            >
                <button
                    v-if="overworkContainerVisible"
                    title="Your opponent may flip 1 of your station cards & you receive 2 action points"
                    class="overwork darkButton"
                    @click="overwork"
                >
                    Overwork
                </button>

                <button
                    v-if="perfectPlanContainerVisible"
                    title="Your opponent may flip 2 of your station cards & you may select any card to put in your hand"
                    class="perfectPlan darkButton"
                    @click="perfectPlan"
                >
                    Perfect Plan
                </button>
            </div>
        </portal>
        <InfoModeContainer />
        <EndGameHudContainer />
        <StationDescriptions />
        <portal to="playerDrawPile">
            <span
                v-if="canDrawCards"
                class="playerDrawPileDescription descriptionText"
            >
                Click to draw
            </span>
        </portal>
        <portal to="opponentDrawPile">
            <span
                v-if="canMill"
                class="opponentDrawPileDescription descriptionText"
            >
                Click to mill {{ millCardCount }} cards
            </span>
        </portal>
        <portal
            v-if="enlargedCardVisible"
            to="match"
        >
            <div class="dimOverlay" />
            <div
                v-click-outside="hideEnlargedCard" class="card card--enlarged"
                :style="cardStyle"
            />
        </portal>
        <portal
            v-if="firstRequirementIsFindCard && !waitingForOtherPlayerToFinishRequirements"
            to="match"
        >
            <FindCard />
        </portal>
        <portal
            v-if="firstRequirementIsCounterCard"
            to="match"
        >
            <CounterCard />
        </portal>
        <portal
            v-if="firstRequirementIsCounterAttack"
            to="match"
        >
            <CounterAttack />
        </portal>
        <NotificationBannerContainer />
    </div>
</template>
<script>
    import NotificationBannerContainer from "./notificationBanner/NotificationBannerContainer.vue";
    import EndGameHudContainer from "./hud/endGame/EndGameHudContainer.vue";
    import InfoModeContainer from "./infoMode/InfoModeContainer.vue";
    import GuideText from "./hud/guideText/GuideText.vue";
    import StationDescriptions from "./hud/StationDescriptions.vue";

    const Vuex = require('vuex');
    const resolveModuleWithPossibleDefault = require('../../client/utils/resolveModuleWithPossibleDefault.js');
    const FindCard = resolveModuleWithPossibleDefault(require('./findCard/FindCard.vue'));
    const CounterCard = resolveModuleWithPossibleDefault(require('./counterCard/CounterCard.vue'));
    const CounterAttack = resolveModuleWithPossibleDefault(require('./counterAttack/CounterAttack.vue'));
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const { mapGetters: mapPermissionGetters } = Vuex.createNamespacedHelpers('permission');
    const cardHelpers = Vuex.createNamespacedHelpers('card');
    const requirementHelpers = Vuex.createNamespacedHelpers('requirement');
    const startGameHelpers = Vuex.createNamespacedHelpers('startGame');
    const { PHASES } = require('./phases.js');

    export default {
        components: {
            StationDescriptions,
            GuideText,
            InfoModeContainer,
            EndGameHudContainer,
            NotificationBannerContainer,
            FindCard,
            CounterCard,
            CounterAttack,
        },
        data() {
            return {
                enlargedCardVisible: false,
            };
        },
        computed: {
            ...startGameHelpers.mapGetters([
                'readyButtonVisible'
            ]),
            ...mapState([
                'phase',
                'playerCardsOnHand',
            ]),
            ...mapGetters([
                'nextPhaseWithAction',
                'cardsToDrawInDrawPhase',
                'maxHandSize',
                'actionPoints2',
                'queryEvents',
                'playerRetreated',
                'opponentRetreated',
                'turnControl',
                'gameConfig',
                'gameOn',
                'playerPerfectPlan',
                'playerRuleService',
            ]),
            ...requirementHelpers.mapGetters([
                'waitingForOtherPlayerToFinishRequirements',
                'firstRequirement',
                'firstRequirementIsDrawCard',
                'firstRequirementIsFindCard',
                'firstRequirementIsCounterCard',
                'firstRequirementIsCounterAttack',
                'cardsLeftToSelect',
                'countInFirstRequirement',
                'requirementCardImageUrl'
            ]),
            ...cardHelpers.mapState([
                'holdingCard'
            ]),
            ...cardHelpers.mapGetters([
                'activeActionCardImageUrl'
            ]),
            ...mapPermissionGetters([
                'canDrawCards',
                'canMill',
                'canIssueOverwork',
                'opponentHasControlOfPlayersTurn'
            ]),
            startGameButtonContainerVisible() {
                return this.readyButtonVisible;
            },
            nextPhaseButtonContainerVisible() {
                return this.gameOn && !this.holdingCard;
            },
            overworkContainerVisible() {
                return this.canIssueOverwork && !this.holdingCard;
            },
            perfectPlanContainerVisible() {
                return this.playerPerfectPlan.canIssuePerfectPlan() && !this.holdingCard;
            },
            gameHasEnded() {
                return this.hasWonGame || this.hasLostGame;
            },
            hasWonGame() {
                return this.opponentRetreated;
            },
            hasLostGame() {
                return this.playerRetreated;
            },
            PHASES() {
                return PHASES;
            },
            endTurnButtonVisible() {
                return !this.nextPhaseWithAction || this.nextPhaseWithAction === PHASES.wait;
            },
            nextPhaseButtonText() {
                if (this.endTurnButtonVisible) return '';
                if (this.phase === PHASES.wait) return '';
                if (this.phase === PHASES.preparation) {
                    return `Go to ${(this.nextPhaseWithAction)} phase`;
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
                    && this.phase !== PHASES.wait
                    && !this.turnControl.opponentHasControlOfPlayersTurn();
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
            },
            millCardCount() {
                return this.gameConfig.millCardCount();
            },
            drawCardOrMillText() {
                const count = this.firstRequirementIsDrawCard
                    ? this.countInFirstRequirement
                    : this.playerRuleService.countCardsLeftToDrawForDrawPhase();
                if (this.canMill) {
                    if (count > 1) {
                        return `Draw card or Mill opponent (x${count})`;
                    }
                    return `Draw card or Mill opponent`;
                }
                return `Draw ${count} ${pluralize('card', count)}`;
            }
        },
        methods: {
            ...mapActions([
                'goToNextPhase',
                'overwork',
                'perfectPlan',
            ]),
            ...startGameHelpers.mapActions([
                'playerReady'
            ]),
            readyClick() {
                this.playerReady();
            },
            nextPhaseClick() {
                this.goToNextPhase();
            },
            hideEnlargedCard() {
                this.enlargedCardVisible = false;
            },
            showEnlargedCard() { //TODO Should use new expandedCard component instead!
                this.enlargedCardVisible = true;
            },
        },
    };

    function pluralize(word, count) {
        return count === 1 ? word : word + 's';
    }
</script>
<style scoped lang="scss">
    @import "enlargeCard";
    @import "miscVariables";
    @import "./hud/guiDescription";

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

    .nextPhaseButtonContainer,
    .startGameButtonContainer {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        box-sizing: border-box;
    }

    .nextPhaseButtonContainer {
        min-width: 15%;
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

    .startGameButtonContainer {
        width: 100%;
    }

    .readyButton {
        width: 240px;
        height: 48px;
        font-size: 1.4em;
        letter-spacing: .1em;
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
</style>
