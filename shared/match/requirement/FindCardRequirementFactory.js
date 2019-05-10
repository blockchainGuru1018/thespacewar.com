FindCardRequirementFactory.type = 'findCard';

function FindCardRequirementFactory({
    sourceFetcher,
    requirementSpec,
    card
}) {

    return {
        create
    };

    function create() {
        return {
            type: requirementSpec.type,
            cardGroups: requirementSpec.sources.map(cardGroupFromSource),
            count: requirementSpec.count,
            cardCommonId: card.commonId,
            target: requirementSpec.target
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
