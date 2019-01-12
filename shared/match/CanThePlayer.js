const Neutralization = require('../card/Neutralization.js');

class MatchService {

    constructor({
        playerStateService,
        opponentStateService
    } = {}) {
        this._playerStateService = playerStateService;
        this._opponentStateService = opponentStateService;

    }

    useThisDurationCard(cardId) {
        this._playerStateService.hasDurationCardOfType(Neutralization.CommonId);
        this._opponentStateService.hasDurationCardOfType(Neutralization.CommonId);
    }
}

module.exports = MatchService;