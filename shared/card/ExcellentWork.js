const info = require('./info/14.config.js');
const BaseCard = require('./BaseCard.js');

module.exports = class ExcellentWork extends BaseCard {

    static get CommonId() {
        return info.CommonId;
    }

    static get Info() {
        return info;
    }

    get choicesWhenPutDownInHomeZone() {
        return info.choicesWhenPutDownInHomeZone;
    }

    get canBePutDownAsExtraStationCard() {
        return true;
    }
};
