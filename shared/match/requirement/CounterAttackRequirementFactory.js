CounterAttackRequirementFactory.type = "counterAttack";

function CounterAttackRequirementFactory({
  opponentStateService,
  playerStateService,
  requirementSpec,
  card,
  queryAttacks,
}) {
  return {
    create,
  };

  function create() {
    return {
      type: requirementSpec.type,
      attacks: attacks(),
      count: requirementSpec.count,
      cardId: card.id,
      cardCommonId: card.commonId,
    };
  }

  function attacks() {
    const attackEvents = queryAttacks.canBeCountered();
    return attackEvents.map((event) => {
      const attack = {
        attackerCardData: opponentStateService.findCardFromZonesAndDiscardPile(
          event.attackerCardId
        ),
        time: event.created,
      };

      if (event.defenderCardId) {
        attack.defenderCardsData = [
          playerStateService.findCardFromZonesAndDiscardPile(
            event.defenderCardId
          ),
        ];
      } else {
        attack.targetedStation = true;
        attack.defenderCardsData = event.targetStationCardIds.map((cardId) => {
          return playerStateService.findCardFromAnySource(cardId);
        });
      }

      return attack;
    });
  }
}

module.exports = CounterAttackRequirementFactory;
