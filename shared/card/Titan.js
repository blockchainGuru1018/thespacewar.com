const BaseCard = require('./BaseCard.js');
const Slow = require('./mixins/Slow.js');

module.exports = class Titan extends Slow(BaseCard) {
    static get CommonId() {
        return "4";
    }
};
