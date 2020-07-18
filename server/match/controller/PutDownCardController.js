const CheatError = require("../CheatError.js");
const CardApplier = require("../card/CardApplier.js");
const CardCanBePlayedChecker = require("../card/CardCanBePlayedChecker.js");
const PlayerServiceProvider = require("../../../shared/match/PlayerServiceProvider.js");
const ExcellentWork = require("../../../shared/card/ExcellentWork.js");

function PutDownCardController(deps) {
  const {
    matchService,
    matchComService,
    cardFactory,
    playerServiceProvider,
    gameActionTimeMachine,
    playerRequirementUpdaterFactory,
    playerServiceFactory,
    playerRequirementServicesFactory,
    CardFacade,
  } = deps;

  const cardApplier = CardApplier({
    playerServiceProvider,
    playerServiceFactory,
    matchService,
  });
  const cardCanBePlayedChecker = CardCanBePlayedChecker({
    playerServiceProvider,
    playerServiceFactory,
    matchService,
  });

  return {
    onPutDownCard,
    cancelCounterCard,
    counterCard,
  };

  function onPutDownCard(playerId, { location, cardId, choice }) {
    console.log(playerId);
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const cardData = playerStateService.findCardFromAnySource(cardId);
    if (!cardData) throw new CheatError(`Cannot find card`);

    checkIfCanPutDownCard({ playerId, location, cardData, choice });

    gameActionTimeMachine.saveStateForCardId(cardId);

    removeCardFromCurrentLocation({ playerId, location, cardData });
    if (location.startsWith("station")) {
      putDownStationCard({ playerId, location, cardData, choice });
    } else {
      putDownCardInZone({ playerId, cardData, choice });
    }
  }

  function cancelCounterCard(playerId, { cardId }) {
    validateIfCanProgressCounterCardRequirementByCount(0, playerId);
    removeCounterCardRequirment(playerId);

    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const card = playerStateService.createBehaviourCardById(cardId);
    if (card.type === "event") {
      gameActionTimeMachine.revertStateToBeforeCardWasPutDown(cardId);
    }

    matchComService.emitCurrentStateToPlayers();
  }

  function counterCard(playerId, { cardId, targetCardId }) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const cardData = playerStateService.findCardFromAnySource(cardId);
    if (!cardData) throw new CheatError(`Cannot find card`);

    validateIfCanProgressCounterCardRequirementByCount(1, playerId);
    progressCounterCardRequirementByCount(1, playerId); //TODO Is this necessary? As the game resets below, also the requirement should reset...

    const opponentId = matchService.getOpponentId(playerId);
    const opponentStateService = playerServiceProvider.getStateServiceById(
      opponentId
    );
    const targetCard = opponentStateService.createBehaviourCardById(
      targetCardId
    );

    gameActionTimeMachine.revertStateToBeforeCardWasPutDown(targetCardId);

    const turnControl = playerServiceFactory.turnControl(playerId);
    if (turnControl.opponentHasControlOfPlayersTurn()) {
      const opponentTurnControl = playerServiceFactory.turnControl(opponentId);
      opponentTurnControl.releaseControlOfOpponentsTurn();
    }

    opponentStateService.counterCard(targetCardId);

    playerStateService.useToCounter(cardId);

    const opponentActionLog = playerServiceFactory.actionLog(
      matchService.getOpponentId(playerId)
    );
    opponentActionLog.opponentCounteredCard({
      cardCommonId: targetCard.commonId,
    });

    matchComService.emitCurrentStateToPlayers();
  }

  function validateIfCanProgressCounterCardRequirementByCount(count, playerId) {
    const playerRequirementUpdater = playerRequirementUpdaterFactory.create(
      playerId,
      { type: "counterCard" }
    );
    const canProgressRequirement = playerRequirementUpdater.canProgressRequirementByCount(
      count
    );
    if (!canProgressRequirement) {
      throw new CheatError("Cannot counter card");
    }
  }

  function progressCounterCardRequirementByCount(count, playerId) {
    const playerRequirementUpdater = playerRequirementUpdaterFactory.create(
      playerId,
      { type: "counterCard" }
    );
    playerRequirementUpdater.progressRequirementByCount(count);
  }

  function removeCounterCardRequirment(playerId) {
    const playerRequirementUpdater = playerRequirementUpdaterFactory.create(
      playerId,
      { type: "counterCard" }
    );
    playerRequirementUpdater.resolve();
  }

  function checkIfCanPutDownCard({ playerId, location, cardData, choice }) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const ruleService = playerServiceProvider.byTypeAndId(
      PlayerServiceProvider.TYPE.rule,
      playerId
    );

    const nameOfCardSource = playerStateService.nameOfCardSource(cardData.id);
    if (nameOfCardSource === location && choice !== "putDownAsExtraStationCard")
      throw new CheatError("Card is already at location");

    if (location === "zone") {
      const card = playerStateService.createBehaviourCard(cardData);
      if (
        !ruleService.canPutDownCardsInHomeZone() &&
        !card.canBePutDownAnyTime()
      ) {
        throw new CheatError("Cannot put down card");
      }

      const canOnlyHaveOneOfCardInZone = cardFactory
        .createCardForPlayer(cardData, playerId)
        .canOnlyHaveOneInHomeZone();
      if (
        canOnlyHaveOneOfCardInZone &&
        playerStateService.hasCardOfTypeInZone(cardData.commonId)
      ) {
        throw new CheatError("Cannot put down card");
      }

      const playerActionPoints = playerStateService.getActionPointsForPlayer();
      const canAffordCard =
        playerActionPoints >= card.cost + (cardData.costIncrease || 0);
      if (!canAffordCard) {
        throw new CheatError("Cannot afford card");
      }

      if (cardCanBePlayedChecker.hasCheckerForCard(cardData)) {
        if (
          !cardCanBePlayedChecker.canBePlayed(playerId, cardData, { choice })
        ) {
          throw new CheatError("Cannot put down card");
        }
      }

      if (!card.canBePlayed()) {
        throw new CheatError("Cannot put down card");
      }
    } else if (location.startsWith("station")) {
      CardFacade(cardData.id, playerId).CardCanBePlacedInStation()({
        withError: true,
      });
    }
  }

  function removeCardFromCurrentLocation({ playerId, cardData }) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const cardId = cardData.id;
    if (playerStateService.hasCardOnHand(cardId)) {
      removeCardFromPlayerHand(playerId, cardId);
    } else if (playerStateService.hasCardInStationCards(cardId)) {
      removeStationCardFromPlayer(playerId, cardId);
    }
  }

  function putDownCardInZone({ playerId, cardData, choice }) {
    const opponentActionLog = playerServiceFactory.actionLog(
      matchService.getOpponentId(playerId)
    );
    opponentActionLog.opponentPlayedCards({
      cardIds: [cardData.id],
      cardCommonIds: [cardData.commonId],
    });

    cardApplier.putDownCard(playerId, cardData, { choice });

    const canAddRequirementFromSpec = playerRequirementServicesFactory.canAddRequirementFromSpec(
      playerId
    );
    if (
      canAddRequirementFromSpec.forCardPutDownInHomeZoneWithChoice(
        cardData,
        choice
      )
    ) {
      const addRequirementFromSpec = playerServiceFactory.addRequirementFromSpec(
        playerId
      );
      addRequirementFromSpec.forCardPutDownInHomeZone(cardData);
    }

    const turnControl = playerServiceFactory.turnControl(playerId);
    if (turnControl.playerHasControlOfOpponentsTurn()) {
      turnControl.releaseControlOfOpponentsTurn();
      matchComService.emitCurrentStateToPlayers();
    }
  }

  function putDownStationCard({ playerId, location, cardData, choice }) {
    if (cardData.commonId === ExcellentWork.CommonId) {
      // WORKAROUND: This is just lazy. Should be a more general approach perhaps.
      const opponentActionLog = playerServiceFactory.actionLog(
        matchService.getOpponentId(playerId)
      );
      opponentActionLog.opponentPlayedCards({
        cardIds: [cardData.id],
        cardCommonIds: [cardData.commonId],
      });
    }

    const opponentActionLog = playerServiceFactory.actionLog(
      matchService.getOpponentId(playerId)
    );
    opponentActionLog.opponentExpandedStation();

    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    playerStateService.addStationCard(cardData, location, {
      putDownAsExtraStationCard: choice === "putDownAsExtraStationCard",
      cardCost: 2,
    });
  }

  function removeCardFromPlayerHand(playerId, cardId) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const cardsOnHand = playerStateService.getCardsOnHand();
    const cardIndexOnHand = cardsOnHand.findIndex((c) => c.id === cardId);
    const cardData = cardsOnHand[cardIndexOnHand];
    if (!cardData) throw new CheatError("Card is not on hand");

    playerStateService.removeCardFromHand(cardId);
    return cardData;
  }

  function removeStationCardFromPlayer(playerId, cardId) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const stationCard = playerStateService.findStationCard(cardId);
    if (!stationCard.flipped)
      throw new CheatError(
        "Cannot move station card that is not flipped to zone"
      );

    playerStateService.removeStationCard(cardId);
    return stationCard;
  }
}

module.exports = PutDownCardController;
