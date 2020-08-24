const CheatError = require("../server/match/CheatError.js");

module.exports = function ({
  matchService,
  stateSerializer,
  gameActionTimeMachine,
  playerStateService,
  canThePlayer,
  opponentStateService,
  opponentActionLog,
}) {
  return {
    validateAttackOnStationCards,
    attackStationCards,
  };

  function validateAttackOnStationCards(
    playerId,
    { attackerCardId, targetStationCardIds, usingCollision }
  ) {
    const attackerCard = playerStateService.createBehaviourCardById(
      attackerCardId
    );
    attackerCard.usingCollision = usingCollision;

    const cannotAttackStationCards = canThePlayer.attackStationCards(
      attackerCard
    );

    if (!cannotAttackStationCards)
      throw new CheatError("Cannot attack station cards");

    const opponentStationCards = opponentStateService.getStationCards();

    const totalOpponentShieldCards = opponentStateService.getMatchingBehaviourCards(
      (c) => c.stopsStationAttack()
    );

    const totalShieldDamage = totalOpponentShieldCards.reduce(
      (acc, card) => acc + card.defense,
      0
    );

    const unflippedOpponentStationCardsCount = opponentStateService.getUnflippedStationCardsCount();

    if (totalShieldDamage > attackerCard.attack) {
      throw new CheatError("Your damage cant goes through actives shields");
    }

    if (
      unflippedOpponentStationCardsCount > targetStationCardIds.length &&
      attackerCard.attack - totalShieldDamage > targetStationCardIds.length
    ) {
      throw new CheatError("Need more target station cards to attack");
    }

    if (!attackerCard.canAttackStationCards()) {
      throw new CheatError("Cannot attack station");
    }
    if (targetStationCardIds.length > attackerCard.attack) {
      throw new CheatError("Cannot attack that many station cards with card");
    }

    const targetStationCards = opponentStationCards.filter((s) =>
      targetStationCardIds.includes(s.card.id)
    );
    if (targetStationCards.some((c) => c.flipped)) {
      throw new CheatError("Cannot attack a flipped station card");
    }
  }

  function attackStationCards({
    attackerCardId,
    targetStationCardIds,
    usingCollision,
  }) {
    const targetStationCards = opponentStateService
      .getStationCards()
      .filter((s) => targetStationCardIds.includes(s.card.id));
    if (!targetStationCards.length) return;

    const stateBeforeAttack = stateSerializer.serialize(
      matchService.getState()
    );

    for (const targetCardId of targetStationCardIds) {
      opponentStateService.flipStationCard(targetCardId);
    }

    const event = playerStateService.registerAttack({
      attackerCardId,
      targetStationCardIds,
    });

    const attackData = {
      attackerCardId,
      defenderCardIds: targetStationCardIds,
      time: event.created,
    };
    gameActionTimeMachine.saveStateForAttackData(stateBeforeAttack, attackData);

    opponentActionLog.stationCardsWereDamaged({
      targetCount: targetStationCardIds.length,
    });

    const attackerCardData = playerStateService.findCard(attackerCardId);
    const attackerCard = playerStateService.createBehaviourCard(
      attackerCardData
    );
    if (attackerCard.type === "missile" || usingCollision) {
      playerStateService.removeCard(attackerCardId);
      playerStateService.discardCard(attackerCardData);
    }

    const totalOpponentShieldCards = opponentStateService.getMatchingBehaviourCards(
      (c) => c.stopsStationAttack()
    );

    totalOpponentShieldCards.forEach((shieldCard) => {
      opponentStateService.removeCard(shieldCard.id);
      // opponentStateService.discardCard(shieldCard);
    });
  }
};
