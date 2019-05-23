const info = require('./info/67.config.js');
const BaseCard = require('./BaseCard.js');

module.exports = class Sabotage extends BaseCard {

    static get CommonId() {
        return info.CommonId;
    }

    static get Info() {
        return info;
    }
};
