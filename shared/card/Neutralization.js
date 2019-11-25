const info = require('./info/12.config.js');
const BaseCard = require('./BaseCard.js');

class Neutralization extends BaseCard {

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

    get disablesDurationCards() {
        return true;
    }

    canTriggerDormantEffect() {
        return true;
    }

    triggerDormantEffect() {
        const spec = Neutralization.Info.dormantEffectRequirementSpec;
        this._addRequirementFromSpec.forCardAndSpec(this, spec);
    }
}

module.exports = Neutralization;
