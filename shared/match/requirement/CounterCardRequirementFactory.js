CounterCardRequirementFactory.type = 'counterCard';

function CounterCardRequirementFactory({
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
            cardGroups: requirementSpec.sources.map(source => cardGroupFromSource(source, card)),
            count: requirementSpec.count,
            cardId: card.id,
            cardCommonId: card.commonId
        };
    }

    function cardGroupFromSource(source, triggerCard) {
        const fetchCardsFromSource = sourceFetcher[source];
        const filter = requirementSpec.filter;
        const options = { triggerCard };

        return {
            source,
            cards: fetchCardsFromSource(filter, options)
        };
    }
}

module.exports = CounterCardRequirementFactory;
