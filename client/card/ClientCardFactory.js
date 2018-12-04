const CardFactory = require('../../shared/card/CardFactory.js');
const ClientMatchService = require('./ClientMatchService.js');
const CardDataAssembler = require('../../shared/CardDataAssembler.js');

module.exports = class ClientCardFactory extends CardFactory {

    constructor() {
        const clientMatchService = new ClientMatchService();
        super({
            matchService: clientMatchService
        });

        this._cardDataAssembler = CardDataAssembler();
        this._matchService = clientMatchService;
    }

    createFromVuexStore(cardInfo, state) {
        const cardDataAssembler = this._cardDataAssembler;
        let cardData = !!cardInfo.commonId
            ? { ...cardDataAssembler.createFromCommonId(cardInfo.commonId), ...cardInfo }
            : { ...cardInfo };

        this._matchService.setState(state);
        return super.createCardForPlayer(cardData, state.ownUser.id);
    }
}