const BaseCard = require('./BaseCard.js');

class Supernova extends BaseCard {

    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '15';
    }
}

module.exports = Supernova;