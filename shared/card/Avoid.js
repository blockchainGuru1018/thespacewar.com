const info = require('./info/34.config.js');
const BaseCard = require('./BaseCard.js');
const CanCounterCardsWithCostOrLess = require('./mixins/CanCounterCardsWithCostOrLess.js');
const CanBePutDownAnyTime = require('./mixins/CanBePutDownAnyTime.js');

module.exports = class Avoid extends CanBePutDownAnyTime(CanCounterCardsWithCostOrLess(Infinity, BaseCard)) {

    constructor({ addRequirementFromSpec, ...deps }) {
        super(deps);
        this._addRequirementFromSpec = addRequirementFromSpec;
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
        this._addRequirementFromSpec.forCardAndSpec(this, spec);
    }
};
