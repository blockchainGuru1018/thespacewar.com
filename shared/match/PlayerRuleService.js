class PlayerRuleService {

    constructor({
        playerStateService,
        opponentStateService,
        canThePlayer
    } = {}) {
        this._playerStateService = playerStateService;
        this._opponentStateService = opponentStateService;
        this._canThePlayer = canThePlayer;
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