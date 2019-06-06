class PlayerRuleService {

    constructor({
        playerStateService,
        opponentStateService,
        canThePlayer,
        playerRequirementService,
        playerPhase,
                    turnControl,
                    gameConfig
    } = {}) {
        this._playerStateService = playerStateService;
        this._playerRequirementService = playerRequirementService;
        this._turnControl = turnControl;
        this._playerPhase = playerPhase;
        this._opponentStateService = opponentStateService;
        this._canThePlayer = canThePlayer;
        this._gameConfig = gameConfig;
    }

    canPutDownCardsInHomeZone() {
        let playerRequirements = this._playerRequirementService;
        if (playerRequirements.hasAnyRequirement()) return false;
        if (playerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;

        return (this._turnControl.playerHasControlOfOwnTurn() && this._playerPhase.isAction())
            || this._turnControl.playerHasControlOfOpponentsTurn();
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
            .length * 3
    }

    hasReachedMaximumStationCardCapacity() {
        const stationCardCount = this._playerStateService.getStationCardCount();
        return stationCardCount >= this._gameConfig.maxStationCards();
    }
}

module.exports = PlayerRuleService;
