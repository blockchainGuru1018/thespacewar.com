CounterAttackRequirementFactory.type = 'counterAttack';

function CounterAttackRequirementFactory({
    opponentStateService,
    playerStateService,
    requirementSpec,
    card,
    queryAttacks
}) {

    return {
        create
    };

    function create() {
        return {
            type: requirementSpec.type,
            attacks: attacks(),
            count: requirementSpec.count,
            cardId: card.id,
            cardCommonId: card.commonId
        };
    }

    function attacks() {
        const attackEvents = queryAttacks.canBeCountered();
        return attackEvents.map(event => {
            return {
                attackerCardData: opponentStateService.findCardFromZonesAndDiscardPile(event.attackerCardId),
                defenderCardData: playerStateService.findCardFromZonesAndDiscardPile(event.defenderCardId),
                time: event.created
            };
        });
    }
}

module.exports = CounterAttackRequirementFactory;
