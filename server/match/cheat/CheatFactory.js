const AddRequirementCheat = require("./AddRequirementCheat.js");
const ActionPointsCheat = require("./ActionPointsCheat.js");
const AddCardCheat = require("./AddCardCheat.js");
const RemoveAllRequirementsCheat = require("./RemoveAllRequirementsCheat.js");
const GetCardsInDeckCheat = require("./GetCardsInDeckCheat.js");
const AddDamageStationCardRequirementCheat = require("./AddDamageStationCardRequirementCheat.js");

module.exports = function (deps) {
    const cheats = [
        AddRequirementCheat(deps),
        AddDamageStationCardRequirementCheat(deps),
        ActionPointsCheat(deps),
        AddCardCheat(deps),
        RemoveAllRequirementsCheat(deps),
        GetCardsInDeckCheat(deps),
    ];

    return {
        fromType,
    };

    function fromType(type) {
        return cheats.find((c) => c.getType() === type);
    }
};
