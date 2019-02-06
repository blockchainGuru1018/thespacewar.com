const CardFactory = require('../../shared/card/CardFactory.js');
const MatchService = require('../../shared/match/MatchService.js');

class ServerCardFactory extends CardFactory {

    constructor(deps) {
        super({
            matchService: new MatchService()
        });

        this._getFreshState = deps.getFreshState;
    }

    createCardForPlayer(cardData, playerId) {
        let freshState = this._getFreshState();
        this._matchService.setState(freshState);
        return super.createCardForPlayer(cardData, playerId);
    }

}

module.exports = ServerCardFactory;