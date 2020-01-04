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

            <div class="guideTextContainer" v-if="guideTextContainerVisible">

                <!-- WAITING FOR OPPONENT REQUIREMENT texts -->
                <div
                    v-if="waitingForOtherPlayerToFinishRequirements"
                    class="guideText-waitingForOtherPlayer guideText guideText--small"
                >
                    <template v-if="waitingRequirement.reason === 'emptyDeck'">
                        Your opponent is dealing damage to your station
                    </template>
                    <template v-else>
                        Waiting for other player
                    </template>
                </div>

                <!-- ACTION and REQUIREMENT texts -->
                <div
                    v-else-if="actionGuideText"
                    class="guideText guideText--small"
                >
                    <div
                        :style="cardStyle"
                        class="guideTextCardWrapper card" @click="showEnlargedCard"
                    >
                        <div class="enlargeIcon enlargeIcon--small" />
                    </div>
                    {{ actionGuideText }}
                </div>
                <div
                    v-else-if="requirementGuideText"
                    class="guideText guideText--small"
                >
                    <div
                        class="guideTextCardWrapper card"
                        :style="cardStyle"
                        @click="showEnlargedCard"
                    >
                        <div class="enlargeIcon enlargeIcon--small" />
                    </div>
                    {{ requirementGuideText }}
                    <SkipDrawCard v-if="shouldShowSkipDrawCard" />
                </div>

                <!-- STARTING GAME texts -->
                <template v-else-if="selectingStartingStationCards">
                    <div
                        v-if="startingStationCardsToPutDownCount > 0"
                        class="guideText-wrapper"
                    >
                        <div class="guideText">
                            Expand your space station with {{ startingStationCardsToPutDownCount }}
                            {{ startingStationCardsToPutDownCount === 1 ? 'card' : 'cards' }}
                        </div>
                        <div class="guideText-subText">
                            You lose when all your station cards are damaged
                        </div>
                    </div>
                    <div
                        v-else-if="playerIsReady"
                        class="guideText-waitingForOtherPlayer guideText guideText--small"
                    >
                        Waiting for other player
                    </div>
                </template>
                <div
                    v-else-if="waitingForOtherPlayerToSelectStartingPlayer"
                    class="guideText-waitingForOtherPlayer guideText guideText--small"
                >
                    Your opponent is choosing who goes
                    f
                    <span style="letter-spacing:.1em;">ir</span>
                    st
                </div>

                <!-- SELECT STATION CARDS FOR ATTACK texts -->
                <div
                    v-else-if="numberOfStationCardsToSelect > 0"
                    class="guideText"
                >
                    Select {{ numberOfStationCardsToSelect }}
                    more station {{ numberOfStationCardsToSelect === 1 ? 'card' : 'cards' }}
                </div>

                <!-- LAST STAND texts -->
                <div v-else-if="opponentLastStandText">
                    <div class="guideText">
                        Your opponent is making a last stand
                    </div>
                    <div class="guideText-subText">
                        {{ opponentLastStandText }}
                    </div>
                </div>
                <div v-else-if="lastStandText">
                    <div class="guideText">
                        Last stand
                    </div>
                    <div class="guideText-subText">
                        {{ lastStandText }}
                    </div>
                </div>

                <!-- TURN CONTROL texts -->
                <div
                    v-else-if="opponentHasControlOfPlayersTurn"
                    class="guideText-wrapper"
                >
                    <div class="guideText">
                        Your opponent has taken control
                    </div>
                    <div class="guideText-subText">
                        wait to have it back
                    </div>
                </div>

                <!-- PHASE texts -->
                <div
                    v-else-if="phase === PHASES.draw"
                    class="guideText-wrapper"
                >
                    <div class="guideText-drawPhaseText guideText">
                        Your turn
                    </div>
                    <div class="guideText-drawPhaseSubText guideText-drawCard guideText-subText">
                        {{ drawCardOrMillText }}
                    </div>
                </div>
                <div
                    v-else-if="phase === PHASES.preparation"
                    class="guideText-discardDurationCards guideText guideText--small"
                >
                    Discard any duration card you don't want to pay for
                </div>
                <div
                    v-else-if="inDiscardPhaseAndMustDiscardCard"
                    class="guideText-drawCard guideText guideText--small"
                >
                    Discard {{ amountOfCardsToDiscard + (amountOfCardsToDiscard === 1 ? ' card' : ' cards') }} to
                    continue
                </div>
                <template v-else-if="showActionPoints">
                    <div class="playerActionPoints">
                        {{ playerActionPointsText }}
                    </div>
                </template>

                <!-- WAIT PHASE and TURN CONTROL texts -->
                <div
                    v-else-if="turnControl.canToggleControlOfTurn()"
                    class="guideText-wrapper"
                >
                    <div class="guideText">
                        {{ textOnWaitPhase }}
                    </div>
                    <div class="guideText-subText">
                        <button
                            class="toggleControlOfTurn darkButton"
                            title="Or press space to toggle control"
                            @click="toggleControlOfTurn"
                            @keydown.space.stop.prevent="toggleControlOfTurn"
                        >
                            {{ turnControlButtonText }}
                        </button>
                    </div>
                </div>
            </div>

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
        <EndGameHudContainer />
        <portal to="stationDrawRow">
            <span class="stationRowDescription descriptionText">
                Draw {{ cardsToDrawInDrawPhase }} card{{ cardsToDrawInDrawPhase === 1 ? '' : 's' }} each turn
            </span>
        </portal>
        <portal to="stationActionRow">
            <span class="stationRowDescription descriptionText">
                Start turn with {{ actionPointsFromStationCards }} action point{{ actionPointsFromStationCards === 1 ? '' : 's' }}
            </span>
        </portal>
        <portal to="stationHandSizeRow">
            <span class="stationRowDescription descriptionText">
                Max {{ maxHandSize }} card{{ maxHandSize === 1 ? '' : 's' }} on hand
            </span>
        </portal>
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

    const Vuex = require('vuex');
    const resolveModuleWithPossibleDefault = require('../../client/utils/resolveModuleWithPossibleDefault.js');
    const FindCard = resolveModuleWithPossibleDefault(require('./findCard/FindCard.vue'));
    const CounterCard = resolveModuleWithPossibleDefault(require('./counterCard/CounterCard.vue'));
    const CounterAttack = resolveModuleWithPossibleDefault(require('./counterAttack/CounterAttack.vue'));
    const SkipDrawCard = resolveModuleWithPossibleDefault(require('./hud/SkipDrawCard.vue'));
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const { mapGetters: mapPermissionGetters } = Vuex.createNamespacedHelpers('permission');
    const cardHelpers = Vuex.createNamespacedHelpers('card');
    const ghostHelpers = Vuex.createNamespacedHelpers('ghost');
    const requirementHelpers = Vuex.createNamespacedHelpers('requirement');
    const startGameHelpers = Vuex.createNamespacedHelpers('startGame');
    const MatchMode = require('../../shared/match/MatchMode.js');
    const LastStand = require('../../shared/match/LastStand.js');
    const { PHASES } = require('./phases.js');
    const FatalError = require('../../shared/card/FatalError.js');

    export default {
        components: {
            EndGameHudContainer,
            NotificationBannerContainer,
            FindCard,
            CounterCard,
            CounterAttack,
            SkipDrawCard
        },
        data() {
            return {
                enlargedCardVisible: false,
                lastStandRemainingSeconds: Math.round(LastStand.LastStandLength / 1000),
                lastStandUpdateIntervalId: null
            };
        },
        computed: {
            ...startGameHelpers.mapGetters([
                'readyButtonVisible'
            ]),
            ...mapState([
                'mode',
                'currentPlayer',
                'phase',
                'ownUser',
                'opponentUser',
                'selectedDefendingStationCards',
                'requirements',
                'playerCardsOnHand',
                'readyPlayerIds',
                'lastStandInfo'
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
                'allPlayerStationCards',
                'playerRetreated',
                'opponentRetreated',
                'turnControl',
                'startingStationCardsToPutDownCount',
                'gameConfig',
                'choosingStartingPlayer',
                'isOwnTurn',
                'gameOn',
                'playerPerfectPlan',
                'playerRuleService',
                'lastStand'
            ]),
            ...requirementHelpers.mapGetters([
                'waitingForOtherPlayerToFinishRequirements',
                'waitingRequirement',
                'firstRequirement',
                'firstRequirementIsDiscardCard',
                'firstRequirementIsDamageStationCard',
                'firstRequirementIsDrawCard',
                'firstRequirementIsFindCard',
                'firstRequirementIsCounterCard',
                'firstRequirementIsCounterAttack',
                'cardsLeftToSelect',
                'selectedCardsCount',
                'countInFirstRequirement',
                'requirementCardImageUrl'
            ]),
            ...cardHelpers.mapState([
                'activeAction',
                'holdingCard'
            ]),
            ...cardHelpers.mapGetters([
                'activeActionCardImageUrl'
            ]),
            ...mapPermissionGetters([
                'canDrawCards',
                'canMill',
                'canIssueOverwork',
                'opponentHasControlOfPlayersTurn',
                'playerHasControlOfOpponentsTurn'
            ]),
            ...ghostHelpers.mapGetters([
                'activateEventCardGhostVisible'
            ]),
            startGameButtonContainerVisible() {
                return this.readyButtonVisible;
            },
            nextPhaseButtonContainerVisible() {
                return this.gameOn && !this.holdingCard;
            },
            guideTextContainerVisible() {
                if (this.choosingStartingPlayer) return false;
                if (this.activateEventCardGhostVisible) return false;

                return true;
            },
            overworkContainerVisible() {
                return this.canIssueOverwork && !this.holdingCard;
            },
            perfectPlanContainerVisible() {
                return this.playerPerfectPlan.canIssuePerfectPlan() && !this.holdingCard;
            },
            playerIsReady() {
                return this.readyPlayerIds.includes(this.ownUser.id);
            },
            waitingForOtherPlayerToSelectStartingPlayer() {
                return this.mode === MatchMode.chooseStartingPlayer && !this.isOwnTurn;
            },
            selectingStartingStationCards() {
                return this.mode === MatchMode.selectStationCards;
            },
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
                return this.opponentRetreated;
            },
            hasLostGame() {
                return this.playerRetreated;
            },
            PHASES() {
                return PHASES;
            },
            lastStandText() {
                if (this.playerHasControlOfOpponentsTurn && !!this.lastStand.hasStarted()) {
                    if (this.lastStand.hasEnded()) {
                        return 'You were too late';
                    }
                    return `${this.lastStandRemainingSeconds}s left to counter defeat`;
                }
                return '';
            },
            opponentLastStandText() {
                if (this.lastStand.hasStarted() && this.lastStandInfo.playerId !== this.ownUser.id) {
                    if (this.lastStand.hasEnded()) {
                        return 'You have won';
                    }
                    return `Your opponent has ${this.lastStandRemainingSeconds}s left to counter defeat`;
                }
                return '';
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
                    return this.drawCardOrMillText;
                }
                else {
                    return '';
                }
            },
            shouldShowSkipDrawCard() {
                return this.firstRequirementIsDrawCard
                    && this.firstRequirement.cardCommonId === FatalError.CommonId;
            },
            actionGuideText() {
                if (!this.activeAction) return '';
                if (this.activeAction.text) {
                    return this.activeAction.text;
                }
                return '';
            },
            textOnWaitPhase() {
                if (this.playerHasControlOfOpponentsTurn) {
                    return 'Put down any 0-cost card';
                }
                return 'Enemy turn';
            },
            turnControlButtonText() {
                if (this.playerHasControlOfOpponentsTurn) {
                    return 'Release control';
                }
                return 'Take control';
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
        watch: {
            lastStandInfo: {
                handler() {
                    if (this.lastStandInfo === null) return;

                    this.lastStandUpdateIntervalId = setInterval(() => {
                        this.lastStandRemainingSeconds = this.lastStand.remainingSeconds();
                        if (this.lastStandRemainingSeconds === 0) clearInterval(this.lastStandUpdateIntervalId);
                    }, 200);
                },
                immediate: true
            }
        },
        destroyed() {
            if (this.lastStandRemainingSeconds === 0) clearInterval(this.lastStandUpdateIntervalId);
        },
        methods: {
            ...mapActions([
                'goToNextPhase',
                'overwork',
                'perfectPlan',
                'toggleControlOfTurn'
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
            showEnlargedCard() { //TODO Should use new expandedCard component instead!
                this.enlargedCardVisible = true;
            },
            hideEnlargedCard() {
                this.enlargedCardVisible = false;
            }
        },
    };

    function pluralize(word, count) {
        return count === 1 ? word : word + 's';
    }
</script>
<style scoped lang="scss">
    @import "enlargeCard";
    @import "miscVariables";

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

    .descriptionText {
        font-family: sans-serif;
        font-weight: bold;
        color: rgba(180, 180, 180, 0.5);
    }

    .stationRowDescription {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        white-space: nowrap;
        display: flex;
        text-align: right;
        justify-content: flex-end;
        align-items: center;
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
