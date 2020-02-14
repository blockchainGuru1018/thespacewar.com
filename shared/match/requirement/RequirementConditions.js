module.exports = function RequirementConditions({
    requirementConditionsByType,
}) {

    return {
        onlyWhen
    };

    function onlyWhen(name, { card, specForPlayer, target }) {
        const condition = requirementConditionsByType['onlyWhen'].find(condition => condition.is(name));
        return condition.check({ card, specForPlayer, target });
    }
};
