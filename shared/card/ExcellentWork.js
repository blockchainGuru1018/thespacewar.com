const BaseCard = require('./BaseCard.js');

module.exports = class ExcellentWork extends BaseCard {

    static get CommonId() {
        return '14';
    }

    get canBePutDownAsExtraStationCard() {
        return true;
    }
}