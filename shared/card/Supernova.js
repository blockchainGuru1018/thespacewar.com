const BaseCard = require('./BaseCard.js');
const Avoid = require('./Avoid.js');

class Supernova extends BaseCard {

    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '15';
    }

    canBePlayed() {
        return super.canBePlayed() && this._canPlayerAffordStationCards();
    }

    _canPlayerAffordStationCards() {
        return this._playerStateService.getUnflippedStationCards().length > 3;
    }

    _someCardIsPreventingThisCardToBePlayed() {
        return this._queryBoard.opponentHasCardInPlay(card => card.commonId === Avoid.CommonId)
    }
}

module.exports = Supernova;