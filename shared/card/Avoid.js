const info = require('./info/34.config.js');
const BaseCard = require('./BaseCard.js');
const CanCounterCardsWithCostOrLess = require('./mixins/CanCounterCardsWithCostOrLess.js');

module.exports = class Avoid extends CanCounterCardsWithCostOrLess(Infinity, BaseCard) {

    constructor({ playerRequirementService, ...deps }) {
        super(deps);
        this._playerRequirementService = playerRequirementService;
    }

    static get CommonId() {
        return info.CommonId;
    }

    static get Info() {
        return info;
    }

    canTriggerDormantEffect() {
        return true;
    }

    triggerDormantEffect() {
        let spec = Avoid.Info.dormantEffectRequirementSpec;
        this._playerRequirementService.addCardRequirementFromSpec({ card: this, spec });
    }
};
