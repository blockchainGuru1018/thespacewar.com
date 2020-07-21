module.exports = SourceFetcher;

const OpponentSourceToPlayerSource = {
  opponentDrawStationCards: "drawStationCards",
  opponentActionStationCards: "actionStationCards",
  opponentHandSizeStationCards: "handSizeStationCards",
  opponentHand: "hand",
  opponentCardsInZone: "cardsInZone",
};

SourceFetcher.opponentSourceToPlayerSource = (opponentSource) =>
  OpponentSourceToPlayerSource[opponentSource];

function SourceFetcher({
  playerStateService,
  opponentStateService,
  canThePlayer,
}) {
  //TODO Would be a good idea to consider refactoring to follow the Open-closed the next time we're doing work here.
  // For example, each "source" could be their own module which encapsulate how they retrieve the cards and also contain
  // the _single_ mapping from "OpponentSourceToPlayerSource" that relates to it.
  // The modules could take whatever filter is used as a parameter. Or perhaps the modules only fetches behaviour cards
  //  and this module applies the same filtering and shuffling to all modules.
  // It would be even better if it was possible to encapsulate both the _fetching_ from the source as well as applying a "find"
  //  on the same source (see FindCardController).
  return {
    deck: shuffleOutput(deck),
    discardPile: shuffleOutput(discardPile),
    actionStationCards: shuffleOutput(actionStationCards),
    drawStationCards: shuffleOutput(drawStationCards),
    handSizeStationCards: shuffleOutput(handSizeStationCards),
    hand: shuffleOutput(hand),
    currentCardZone,
    cardsInOpponentZone,
    cardsInZone,
    opponentDeck: () => [],
    opponentDiscardPile: () => [],
    opponentDrawStationCards: shuffleOutput(opponentDrawStationCards),
    opponentActionStationCards: shuffleOutput(opponentActionStationCards),
    opponentHandSizeStationCards: shuffleOutput(opponentHandSizeStationCards),
    opponentHand: shuffleOutput(opponentHand),
    opponentAny: shuffleOutput(opponentAny),
    opponentCardsInZone,
  };

  function hand(specFilter) {
    return playerStateService
      .getCardsOnHand()
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function deck(specFilter) {
    return playerStateService
      .getCardsInDeck()
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function discardPile(specFilter) {
    return playerStateService
      .getDiscardedCards()
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }
  function currentCardZone(specFilter) {
    return playerStateService
      .get()
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function drawStationCards(specFilter) {
    return playerStateService
      .getDrawStationCards()
      .filter(stationCardFilter(specFilter))
      .map(cardFromStationCard)
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function cardsInOpponentZone(specFilter) {
    return playerStateService
      .getCardsInOpponentZone()
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function cardsInZone(specFilter) {
    return playerStateService
      .getCardsInZone()
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function actionStationCards(specFilter) {
    return playerStateService
      .getActionStationCards()
      .filter(stationCardFilter(specFilter))
      .map(cardFromStationCard)
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function handSizeStationCards(specFilter) {
    return playerStateService
      .getHandSizeStationCards()
      .filter(stationCardFilter(specFilter))
      .map(cardFromStationCard)
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function opponentAny(specFilter, { triggerCard } = { triggerCard: null }) {
    return opponentStateService
      .getMatchingBehaviourCardsPutDownAnywhere(
        cardFilter(specFilter, triggerCard)
      )
      .map((card) => card.getCardData());
  }

  function opponentCardsInZone(specFilter) {
    return opponentStateService
      .getMatchingBehaviourCardsInZone(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function opponentDrawStationCards(specFilter) {
    return opponentStateService
      .getDrawStationCards()
      .filter(stationCardFilter(specFilter))
      .map(cardFromStationCard)
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function opponentActionStationCards(specFilter) {
    return opponentStateService
      .getActionStationCards()
      .filter(stationCardFilter(specFilter))
      .map(cardFromStationCard)
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function opponentHandSizeStationCards(specFilter) {
    return opponentStateService
      .getHandSizeStationCards()
      .filter(stationCardFilter(specFilter))
      .map(cardFromStationCard)
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function opponentHand(specFilter) {
    return opponentStateService
      .getCardsOnHand()
      .map((cardData) => playerStateService.createBehaviourCard(cardData))
      .filter(cardFilter(specFilter))
      .map((card) => card.getCardData());
  }

  function cardFilter(filter = {}, triggerCard = null) {
    return (card) => {
      if (!cardFulfillsTypeFilter(card, filter)) return false;
      if (!cardFulfillsCommonIdFilter(card, filter)) return false;
      if (!cardFulfillsCanBeCounteredFilter(triggerCard, card, filter))
        return false;
      if (!cardFulfillsExcludeCardIds(card, filter)) return false;
      if (!cardFulfillsActionPointsLeft(card, filter)) return false;

      return true;
    };
  }

  function stationCardFilter(filter = {}) {
    return (stationCard) => {
      if ("onlyFlippedStationCards" in filter) {
        return filter.onlyFlippedStationCards
          ? stationCard.flipped
          : !stationCard.flipped;
      }
      return true;
    };
  }

  function cardFulfillsCanBeCounteredFilter(triggerCard, card, filter) {
    if (filter.canBeCountered !== true) return true;

    return canThePlayer.counterCard(card) && triggerCard.canCounterCard(card);
  }

  function cardFulfillsTypeFilter(card, filter) {
    const hasTypeFilter = "type" in filter;
    return !hasTypeFilter || filter.type.includes(card.type);
  }

  function cardFulfillsCommonIdFilter(card, filter) {
    const hasCommonIdFilter = "commonId" in filter;
    return !hasCommonIdFilter || filter.commonId.includes(card.commonId);
  }

  function cardFulfillsExcludeCardIds(card, filter) {
    const hasExcludeCardIds = "excludeCardIds" in filter;
    return (
      !hasExcludeCardIds ||
      !filter.excludeCardIds.find((value) => value === card.id)
    );
  }

  function cardFulfillsActionPointsLeft(card, filter) {
    const hasActionPointsLeft = "actionPointsLeft" in filter;
    return !hasActionPointsLeft || card.cost <= filter.actionPointsLeft;
  }

  function cardFromStationCard(stationCard) {
    return stationCard.card;
  }
}

function shuffleOutput(method) {
  return (...args) => {
    const output = method(...args);
    shuffle(output);
    return output;
  };
}

function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}
