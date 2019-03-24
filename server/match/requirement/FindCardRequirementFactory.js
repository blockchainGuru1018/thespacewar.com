FindCardRequirementFactory.type = 'findCard';

function FindCardRequirementFactory({
    sourceFetcher,
    playerRequirementService,
    requirementSpec,
    cardData
}) {

    return {
        create
    };

    function create() {
        return {
            type: requirementSpec.type,
            cardGroups: requirementSpec.sources.map(cardGroupFromSource),
            count: requirementSpec.count,
            cardCommonId: cardData.commonId
        };
    }

    function cardGroupFromSource(source) {
        return {
            source,
            cards: sourceFetcher[source](requirementSpec.filter)
        };
    }
}

module.exports = FindCardRequirementFactory;