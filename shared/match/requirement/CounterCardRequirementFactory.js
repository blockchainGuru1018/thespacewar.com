CounterCardRequirementFactory.type = 'counterCard';

function CounterCardRequirementFactory({
    sourceFetcher,
    playerStateService,
    requirementSpec,
    cardData
}) {

    return {
        create
    };

    function create() {
        const card = playerStateService.createBehaviourCard(cardData);
        return {
            type: requirementSpec.type,
            cardGroups: requirementSpec.sources.map(source => cardGroupFromSource(source, card)),
            count: requirementSpec.count,
            cardId: cardData.id,
            cardCommonId: cardData.commonId
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
