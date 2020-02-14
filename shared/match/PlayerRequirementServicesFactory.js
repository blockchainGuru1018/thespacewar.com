const CanAddRequirementFromSpec = require('./requirement/CanAddRequirementFromSpec.js');
const RequirementConditions = require('./requirement/RequirementConditions.js');
const TargetIsFlippedStationCard = require('./requirement/conditions/TargetIsFlippedStationCard.js');

module.exports = function ({
    playerServiceFactory,
    playerCardServicesFactory
}) {

    const objectsByNameAndPlayerId = {};

    const api = {
        _cache: objectsByNameAndPlayerId,
        canAddRequirementFromSpec: cached(canAddRequirementFromSpec),
        requirementConditions: cached(requirementConditions),
        requirementConditionsByType: cached(requirementConditionsByType),
        targetIsFlippedStationCard: cached(targetIsFlippedStationCard),
    };

    return api;

    function canAddRequirementFromSpec(playerId) {
        return CanAddRequirementFromSpec({
            playerStateService: playerServiceFactory.playerStateService(playerId),
            requirementConditions: api.requirementConditions(playerId)
        });
    }

    function requirementConditions(playerId) {
        const opponentCardFactory = playerCardServicesFactory.playerCardFactory(playerServiceFactory.opponentId(playerId));
        return RequirementConditions({
            requirementConditionsByType: api.requirementConditionsByType(playerId),
            opponentCardFactory: opponentCardFactory,
        });
    }

    function requirementConditionsByType(playerId) {
        return {
            onlyWhen: [
                api.targetIsFlippedStationCard(playerId)
            ]
        };
    }

    function targetIsFlippedStationCard(playerId) {
        return TargetIsFlippedStationCard();
    }

    function cached(constructor) {
        const name = constructor.name;
        return (playerIdOrUndefined) => {
            const key = name + ':' + playerIdOrUndefined;
            const existingCopy = objectsByNameAndPlayerId[key];
            if (existingCopy) return existingCopy;

            const result = constructor(playerIdOrUndefined);
            objectsByNameAndPlayerId[key] = result;
            return result;
        };
    }
};
