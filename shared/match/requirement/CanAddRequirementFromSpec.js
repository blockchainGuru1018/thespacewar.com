const infoByCardCommonId = require('../../card/info/infoByCardCommonId.js');

//TODO One confusing idea about this class is that it only _partially_ checks if you can add a requirement.
// when actually adding a requirement a separate check is made to make sure there are enough cards to be draw and if the draw count needs to be adjusted.
// This class specifically checks the "onlyWhen" clause, and other possible future special cases regarding whether a
// requirement should be added or not.
// Maybe there is a better name to this class to clarify this fact?
module.exports = function ({
    playerStateService,
    requirementConditions
}) {

    return {
        forCardPutDownInHomeZone: () => true,
        forCardPutDownInHomeZoneWithChoice,
        forCardWithSpecAndTarget
    };

    function forCardPutDownInHomeZoneWithChoice(cardData, choice) {
        const info = infoByCardCommonId[cardData.commonId];
        if (!info) return;

        const card = playerStateService.createBehaviourCard(cardData);
        const spec = info.requirementSpecsWhenPutDownInHomeZone;
        if (!spec) return;

        return forCardWithSpecAndTarget(card, spec, choice);
    }

    function forCardWithSpecAndTarget(card, spec, target) {
        return spec.forOpponent.every(meetsAll([
                LivesUpToOnlyWhenCondition(card, target),
                LivesUpToOnlyWhenNotCondition(card, target)
            ]))
            && spec.forPlayer.every(meetsAll([
                LivesUpToOnlyWhenCondition(card, target),
                LivesUpToOnlyWhenNotCondition(card, target)
            ]));
    }

    function meetsAll(fns) {
        return data => fns.every(fn => fn(data));
    }

    function LivesUpToOnlyWhenCondition(card, choice) {
        return specForPlayer => {
            if (specForPlayer.onlyWhen) {
                return requirementConditions.onlyWhen(specForPlayer.onlyWhen, { card, specForPlayer, target: choice });
            }
            else {
                return true;
            }
        };
    }

    function LivesUpToOnlyWhenNotCondition(card, choice) {
        return specForPlayer => {
            if (specForPlayer.onlyWhenNot) {
                return requirementConditions.onlyWhenNot(specForPlayer.onlyWhenNot, {
                    card,
                    specForPlayer,
                    target: choice
                });
            }
            else {
                return true;
            }
        };
    }
};

