class PlayerRuleService {

    constructor({
        playerStateService,
        opponentStateService,
        canThePlayer,
        playerRequirementService,
        playerPhase,
        turnControl
    } = {}) {
        this._playerStateService = playerStateService;
        this._playerRequirementService = playerRequirementService;
        this._turnControl = turnControl;
        this._playerPhase = playerPhase;
        this._opponentStateService = opponentStateService;
        this._canThePlayer = canThePlayer;
    }

    canPutDownCardsInHomeZone() {
        let playerRequirements = this._playerRequirementService;
        if (playerRequirements.hasAnyRequirement()) return false;
        if (playerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;

        return (this._turnControl.playerHasControlOfOwnTurn() && this._playerPhase.isActionPhase())
            || this._turnControl.playerHasControlOfOpponentsTurn();
    }

    canPutDownStationCards() {
        let playerRequirements = this._playerRequirementService;
        if (playerRequirements.hasAnyRequirement()) return false;
        if (playerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;

        return this._playerPhase.isActionPhase();
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
}

module.exports = PlayerRuleService;
