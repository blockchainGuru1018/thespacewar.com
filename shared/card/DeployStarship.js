const BaseCard = require("./BaseCard.js");
const info = require("./info/221.config");
module.exports = class DeployStarship extends BaseCard {
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

  get actionWhenPutDownInHomeZone() {
    const spec = info.requirementSpecsWhenPutDownInHomeZone;
    this._addRequirementFromSpec.forCardAndSpec(this, spec);
  }
};
