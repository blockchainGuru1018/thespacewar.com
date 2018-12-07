const CardFactory = require('../../shared/card/CardFactory.js');
const MatchService = require('../../shared/match/MatchService.js');
const CardDataAssembler = require('../../shared/CardDataAssembler.js');
const mapFromClientToServerState = require('./mapFromClientToServerState.js');

module.exports = class ClientCardFactory extends CardFactory {

    constructor() {
        super({
            matchService: new MatchService()
        });

        this._cardDataAssembler = CardDataAssembler();
    }

    createFromVuexStore(cardInfo, state) {
        const cardDataAssembler = this._cardDataAssembler;
        let cardData = !!cardInfo.commonId
            ? { ...cardDataAssembler.createFromCommonId(cardInfo.commonId), ...cardInfo }
            : { ...cardInfo };

        const mappedState = mapFromClientToServerState(state);
        this._matchService.setState(mappedState);
        return super.createCardForPlayer(cardData, state.ownUser.id);
    }
}