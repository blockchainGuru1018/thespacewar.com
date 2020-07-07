module.exports = function RequirementConditions({
    requirementConditionsByType,
    opponentCardFactory,
}) {
    return {
        onlyWhen,
        onlyWhenNot,
    };

    function onlyWhen(names, { card, specForPlayer, target }) {
        return conditionsTypeAndNames("onlyWhen", names).every(
            CheckOnlyWhenCondition({ card, specForPlayer, target })
        );
    }

    function onlyWhenNot(names, { card, specForPlayer, target }) {
        return conditionsTypeAndNames("onlyWhen", names).every(
            Negate(CheckOnlyWhenCondition({ card, specForPlayer, target }))
        );
    }

    function Negate(fn) {
        return (data) => !fn(data);
    }

    function CheckOnlyWhenCondition({ card, specForPlayer, target }) {
        return (condition) => {
            if (condition.targetIsOpponentCard()) {
                const targetOpponentCard = opponentCardFactory.fromId(target);
                return condition.check({
                    card,
                    specForPlayer,
                    targetOpponentCard,
                });
            } else {
                return condition.check({ card, specForPlayer, target });
            }
        };
    }

    function conditionsTypeAndNames(type, conditionNames) {
        return requirementConditionsByType[type].filter((condition) =>
            conditionNames.some((name) => condition.is(name))
        );
    }
};
