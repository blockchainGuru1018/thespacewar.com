const Commander = require('./commander/Commander.js');

class PlayerRuleService {

    constructor({
        matchService,
        playerStateService,
        opponentStateService,
        canThePlayer,
        canTheOpponent,
        playerRequirementService,
        playerPhase,
        turnControl,
        gameConfig,
        queryEvents,
        playerCommanders
    } = {}) {
        this._matchService = matchService;
        this._playerStateService = playerStateService;
        this._playerRequirementService = playerRequirementService;
        this._turnControl = turnControl;
        this._playerPhase = playerPhase;
        this._opponentStateService = opponentStateService;
        this._canThePlayer = canThePlayer;
        this._canTheOpponent = canTheOpponent;
        this._gameConfig = gameConfig;
        this._playerCommanders = playerCommanders;
        this._queryEvents = queryEvents;
    }

    canPutDownCardsInHomeZone() { // TODO Since event cards are graphically put down in the home zone, this name could be confusing as it still covers event cards.
        if (!this._matchService.isGameOn()) return false;
        let playerRequirements = this._playerRequirementService;
        if (playerRequirements.hasAnyRequirement()) return false;
        if (playerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;
        if (this._playerHasCardThatPreventsThemFromPlayingAnyCards()) return false;
        if (this._opponentHasCardThatPreventsPlayerFromPlayingMoreCards()) return false;

        return (this._turnControl.playerHasControlOfOwnTurn() && this._playerPhase.isAction())
            || this._turnControl.playerHasControlOfOpponentsTurn();
    }

    _playerHasCardThatPreventsThemFromPlayingAnyCards() {
        return this._playerStateService.hasMatchingCardInSomeZone(card => {
            return card.preventsPlayerFromPlayingAnyCards
                && this._canThePlayer.useThisCard(card);
        });
    }

    _opponentHasCardThatPreventsPlayerFromPlayingMoreCards() {
        return this._opponentStateService.hasMatchingCardInSomeZone(card => {
            if (!card.limitsOpponentToPlayingMaxCardCount) return false;
            if (!this._canTheOpponent.useThisCard(card)) return false;

            const currentTurn = this._matchService.getTurn();
            const playedCardsCountForPlayer = this._queryEvents.putDownCardInHomeZoneCountOnTurn(currentTurn);
            return playedCardsCountForPlayer >= card.limitsOpponentToPlayingMaxCardCount;
        });
    }

    canPutDownStationCards() {
        if (this._canThePlayer.putDownMoreStartingStationCards()) return true;

        if (this.hasReachedMaximumStationCardCapacity()) return false;

        let playerRequirements = this._playerRequirementService;
        if (playerRequirements.hasAnyRequirement()) return false;
        if (playerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;

        return this._playerPhase.isAction();
    }

    getMaximumHandSize() {
        const playerStateService = this._playerStateService;
        const cardsThatGrantUnlimitedHandSize = playerStateService
            .getMatchingBehaviourCards(c => c.grantsUnlimitedHandSize)
            .filter(c => this._canThePlayer.useThisDurationCard(c.id));
        if (cardsThatGrantUnlimitedHandSize.length > 0) {
            return Infinity;
        }

        let stationCards = playerStateService.getStationCards();
        return stationCards
            .filter(card => card.place === 'handSize')
            .length * 3;
    }

    hasReachedMaximumStationCardCapacity() {
        const stationCardCount = this._playerStateService.getStationCardCount();
        return stationCardCount >= this.maxStationCardCount();
    }

    maxStationCardCount() {
        if (this._playerCommanders.has(Commander.FrankJohnson)) {
            const frankJohnson = this._playerCommanders.get(Commander.FrankJohnson);
            return frankJohnson.maxStationCards();
        }
        else {
            return this._gameConfig.maxStationCards();
        }
    }
}

module.exports = PlayerRuleService;
