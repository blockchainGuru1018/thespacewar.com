const CheatError = require("../CheatError.js");
const PlayerServiceProvider = require("../../../shared/match/PlayerServiceProvider.js");

const MAX_COLLISION_TARGETS_ON_SACRIFICE = 4;

function AttackController(deps) {
  const {
    matchService,
    matchComService,
    cardFactory,
    stateSerializer,
    playerServiceProvider,
    playerServiceFactory,
    gameActionTimeMachine,
    playerRequirementUpdaterFactory,
  } = deps;

  return {
    onAttack,
    counterAttack,
    cancelCounterAttack,
    onAttackStationCards,
    onDamageStationCard,
    onDamageShieldCard,
    onSacrifice,
  };

  function onAttack(
    playerId,
    { attackerCardId, defenderCardId, usingCollision = false }
  ) {
    validateAttack({
      playerId,
      attackerCardId,
      defenderCardId,
      usingCollision,
    });

    const stateBeforeAttack = stateSerializer.serialize(
      matchService.getState()
    );

    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const opponentId = matchService.getOpponentId(playerId);
    const opponentStateService = playerServiceProvider.getStateServiceById(
      opponentId
    );
    const defenderCard = opponentStateService.createBehaviourCardById(
      defenderCardId
    );
    const attackerCard = playerStateService.createBehaviourCardById(
      attackerCardId
    );
    attackerCard._card.usingCollision = usingCollision;
    const damageBefore = defenderCard.damage;
    attackerCard.attackCard(defenderCard);
    const damageAfter = defenderCard.damage;

    const defenderCardWasDestroyed = defenderCard.destroyed;
    matchComService.emitToPlayer(opponentId, "opponentAttackedCard", {
      attackerCardId,
      defenderCardId,
      newDamage: defenderCard.damage,
      defenderCardWasDestroyed,
      attackerCardWasDestroyed: attackerCard.destroyed,
    });

    const event = playerStateService.registerAttack({
      attackerCardId,
      defenderCardId,
    });
    const attackData = {
      attackerCardId,
      defenderCardIds: [defenderCardId],
      time: event.created,
    };
    gameActionTimeMachine.saveStateForAttackData(stateBeforeAttack, attackData);

    if (defenderCardWasDestroyed) {
      const cardData = opponentStateService.removeCard(defenderCardId);
      opponentStateService.discardCard(cardData);
    } else {
      opponentStateService.updateCardById(defenderCardId, (card) => {
        Object.assign(card, defenderCard.getCardData());
      });
    }

    if (attackerCard.destroyed) {
      const cardData = playerStateService.removeCard(attackerCardId);
      playerStateService.discardCard(cardData);
    } else {
      playerStateService.updateCardById(attackerCardId, (card) => {
        Object.assign(card, attackerCard.getCardData());
      });
    }

    const opponentActionLog = playerServiceFactory.actionLog(opponentId);
    if (defenderCardWasDestroyed) {
      opponentActionLog.cardDestroyed({ cardCommonId: defenderCard.commonId });
    } else if (defenderCard.paralyzed) {
      opponentActionLog.paralyzed({
        defenderCardId,
        defenderCardCommonId: defenderCard.commonId,
      });
    } else if (damageBefore !== damageAfter) {
      opponentActionLog.damagedInAttack({
        defenderCardId,
        defenderCardCommonId: defenderCard.commonId,
        damageInflictedByDefender: damageAfter - damageBefore,
      });
    }
  }

  function counterAttack(playerId, { attackIndex }) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );

    validateIfCanProgressCounterAttackRequirementByCount(1, playerId);

    const playerRequirementService = playerServiceFactory.playerRequirementService(
      playerId
    );
    const counterAttackRequirement = playerRequirementService.getFirstMatchingRequirement(
      { type: "counterAttack" }
    );
    const attackData = counterAttackRequirement.attacks[attackIndex];
    if (!attackData) {
      throw new CheatError("Cannot find attack at index in requirement");
    }

    progressCounterCardRequirementByCount(1, playerId);

    gameActionTimeMachine.revertStateToBeforeAttack(attackData);

    const opponentId = matchService.getOpponentId(playerId);
    const opponentStateService = playerServiceProvider.getStateServiceById(
      opponentId
    );
    const options = {
      attackerCardId: attackData.attackerCardData.id,
    };
    if (attackData.targetedStation) {
      options.targetStationCardIds = attackData.defenderCardsData.map(
        (cardData) => cardData.id
      );
    } else {
      options.defenderCardId = attackData.defenderCardsData[0].id;
    }
    opponentStateService.registerAttackCountered(options);

    const cardUsedToCounterId = counterAttackRequirement.cardId;
    playerStateService.useToCounter(cardUsedToCounterId);

    if (attackData.targetedStation) {
      const opponentActionLog = playerServiceFactory.actionLog(opponentId);
      opponentActionLog.opponentCounteredAttackOnStation({
        targetStationCardIds: attackData.defenderCardsData.map(
          (cardData) => cardData.id
        ),
      });
    } else {
      const opponentActionLog = playerServiceFactory.actionLog(opponentId);
      const defenderCardsData = attackData.defenderCardsData[0];
      opponentActionLog.opponentCounteredAttackOnCard({
        defenderCardId: defenderCardsData.id,
        defenderCardCommonId: defenderCardsData.commonId,
      });
    }

    matchComService.emitCurrentStateToPlayers();
  }

  function cancelCounterAttack(playerId, { cardId }) {
    validateIfCanProgressCounterAttackRequirementByCount(0, playerId);
    gameActionTimeMachine.revertStateToBeforeCardWasPutDown(cardId);
    matchComService.emitCurrentStateToPlayers();
  }

  function validateIfCanProgressCounterAttackRequirementByCount(
    count,
    playerId
  ) {
    const playerRequirementUpdater = playerRequirementUpdaterFactory.create(
      playerId,
      { type: "counterAttack" }
    );
    const canProgressRequirement = playerRequirementUpdater.canProgressRequirementByCount(
      count
    );
    if (!canProgressRequirement) {
      throw new CheatError("Cannot counter attack");
    }
  }

  function progressCounterCardRequirementByCount(count, playerId) {
    const playerRequirementUpdater = playerRequirementUpdaterFactory.create(
      playerId,
      { type: "counterAttack" }
    );
    playerRequirementUpdater.progressRequirementByCount(count);
  }

  function validateAttack({
    playerId,
    attackerCardId,
    defenderCardId,
    usingCollision,
  }) {
    const canThePlayer = playerServiceProvider.byTypeAndId(
      PlayerServiceProvider.TYPE.canThePlayer,
      playerId
    );
    const canAttack = canThePlayer.attackCards();
    if (!canAttack) throw new CheatError("Cannot attack");

    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const attackerCardData = playerStateService.findCard(attackerCardId);
    const attackerCard = cardFactory.createCardForPlayer(
      attackerCardData,
      playerId
    );
    if ("canFakeAttack" in attackerCard) {
      if (!attackerCard.canFakeAttack() && !attackerCard.canAttack())
        throw new CheatError("Cannot attack");
    } else if (!attackerCard.canAttack()) {
      throw new CheatError("Cannot attack");
    }

    const opponentId = matchComService.getOpponentId(playerId);
    const opponentStateService = playerServiceProvider.getStateServiceById(
      opponentId
    );
    const defenderCardData = opponentStateService.findCard(defenderCardId);
    const defenderCard = cardFactory.createCardForPlayer(
      defenderCardData,
      opponentId
    );
    if (!attackerCard.canAttackCard(defenderCard))
      throw new CheatError("Cannot attack that card");
    if (!attackerCard.canCollide && usingCollision)
      throw new CheatError("Cannot collide");
  }

  function onAttackStationCards(
    playerId,
    { attackerCardId, targetStationCardIds, usingCollision }
  ) {
    const playerStationAttacker = playerServiceFactory.playerStationAttacker(
      playerId
    );
    playerStationAttacker.validateAttackOnStationCards(playerId, {
      attackerCardId,
      targetStationCardIds,
      usingCollision,
    });
    playerStationAttacker.attackStationCards({
      attackerCardId,
      targetStationCardIds,
      usingCollision,
    });
  }

  function onDamageStationCard(playerId, { targetIds }) {
    const opponentId = matchService.getOpponentId(playerId);
    const opponentStateService = playerServiceProvider.getStateServiceById(
      opponentId
    );
    const playerRequirementService = playerServiceProvider.getRequirementServiceById(
      playerId
    );

    const damageStationCardRequirement = playerRequirementService.getFirstMatchingRequirement(
      { type: "damageStationCard" }
    );
    if (!damageStationCardRequirement) {
      throw new CheatError("Cannot damage station card");
    }
    if (damageStationCardRequirement.count < targetIds.length) {
      throw new CheatError("Cannot damage station card");
    }

    for (const targetId of targetIds) {
      if (!opponentStateService.hasCardInStationCards(targetId)) {
        throw new CheatError("Cannot damage station card");
      }
    }

    for (const targetId of targetIds) {
      opponentStateService.flipStationCard(targetId);
    }

    const requirementUpdater = playerRequirementUpdaterFactory.create(
      playerId,
      { type: "damageStationCard" }
    );
    requirementUpdater.progressRequirementByCount(targetIds.length);
  }

  function onDamageShieldCard(playerId, { targetIds }) {
    const playerRequirementService = playerServiceProvider.getRequirementServiceById(
      playerId
    );

    const damageShieldCardRequirement = playerRequirementService.getFirstMatchingRequirement(
      { type: "damageShieldCard" }
    );
    if (!damageShieldCardRequirement) {
      throw new CheatError("Cannot damage shield card");
    }
    if (damageShieldCardRequirement.count < targetIds.length) {
      throw new CheatError("Cannot damage shield card");
    }

    const requirementUpdater = playerRequirementUpdaterFactory.create(
      playerId,
      { type: "damageShieldCard" }
    );
    requirementUpdater.progressRequirementByCount(targetIds.length);
  }

  function onSacrifice(playerId, { cardId, targetCardId, targetCardIds }) {
    if (!!targetCardIds && !!targetCardId)
      throw new CheatError("Cannot sacrifice");

    const cannotSacrifice = playerServiceProvider
      .byTypeAndId(PlayerServiceProvider.TYPE.canThePlayer, playerId)
      .sacrificeCards();
    if (!cannotSacrifice) throw new CheatError("Cannot sacrifice");

    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const opponentId = matchService.getOpponentId(playerId);
    const opponentStateService = playerServiceProvider.getStateServiceById(
      opponentId
    );

    if (targetCardIds) {
      if (
        !isValidStationCollisionFromSacrifice({
          playerId,
          cardId,
          targetCardIds,
        })
      ) {
        throw new CheatError("Cannot sacrifice");
      }
    } else {
      const targetCardData = opponentStateService.findCard(targetCardId);
      if (!targetCardId) throw new CheatError("Cannot sacrifice");
      if (!targetCardData) throw new CheatError("Cannot sacrifice");
    }

    const cardData = playerStateService.findCard(cardId);
    const card = cardFactory.createCardForPlayer(cardData, playerId);
    if (!card.canBeSacrificed()) throw new CheatError("Cannot sacrifice");

    if (!targetCardIds) {
      const targetCardData = opponentStateService.findCard(targetCardId);
      const targetCard = cardFactory.createCardForPlayer(
        targetCardData,
        opponentId
      );
      if (!card.canTargetCardForSacrifice(targetCard))
        throw new CheatError("Cannot sacrifice");
    }

    const sacrificeCard = playerServiceFactory.sacrificeCard(playerId);
    if (targetCardIds) {
      sacrificeCard.collideWithStation(cardId, targetCardIds);
    } else {
      sacrificeCard.collideWithCard(cardId, targetCardId);
    }
  }

  function isValidStationCollisionFromSacrifice({
    playerId,
    cardId,
    targetCardIds,
  }) {
    if (targetCardIds.length > MAX_COLLISION_TARGETS_ON_SACRIFICE) return false;
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const cardData = playerStateService.findCard(cardId);
    const card = cardFactory.createCardForPlayer(cardData, playerId);
    if (card.isInHomeZone()) return false;

    const opponentId = matchService.getOpponentId(playerId);
    const opponentStateService = playerServiceProvider.getStateServiceById(
      opponentId
    );
    if (opponentStateService.hasCardThatStopsStationAttack()) return false;

    const validTargetIdCount = targetCardIds
      .map((id) => opponentStateService.findStationCard(id))
      .filter((card) => !!card).length;
    const availableTargetCount = opponentStateService
      .getStationCards()
      .filter((card) => !card.flipped).length;
    const isBelowTargetLimit =
      validTargetIdCount < MAX_COLLISION_TARGETS_ON_SACRIFICE;
    const hasMoreAvailableTargets = availableTargetCount > validTargetIdCount;

    return !isBelowTargetLimit || !hasMoreAvailableTargets;
  }
}

module.exports = AttackController;
