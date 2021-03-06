const PlayerServiceProvider = require("../../match/PlayerServiceProvider.js");
const CardFactory = require("../../card/CardFactory.js");
const PlayerStateService = require("../../match/PlayerStateService.js");
const MatchService = require("../../match/MatchService.js");
const fakePlayerServiceFactory = require("./fakePlayerServiceFactory.js");

const playerStateServiceFactory = {
  fromIdAndState,
  withStubs: (stubs = {}) => {
    return {
      isCardStationCard: () => false,
      hasMatchingCardInSameZone: () => false,
      getCardsInDeck: () => [],
      getCardsOnHand: () => [],
      getDiscardedCards: () => [],
      putDownEventCardInZone() {},
      putDownCardInZone() {},
      removeCardFromDeck() {},
      getActionPointsForPlayer: () => 0,
      removeCardFromHomeZone() {},
      findCardFromAnySource() {},
      discardCard() {},
      ...stubs,
    };
  },
};

function fromIdAndState(playerId, state) {
  const matchService = new MatchService();
  matchService.setState(state);
  const playerServiceProvider = PlayerServiceProvider();
  const cardFactory = new CardFactory({
    matchService,
    playerServiceProvider,
    playerServiceFactory: fakePlayerServiceFactory.withStubs(),
  });
  const playerStateService = new PlayerStateService({
    playerId,
    matchService,
    cardFactory,
  });
  playerServiceProvider.registerService(
    PlayerServiceProvider.TYPE.state,
    playerId,
    playerServiceProvider
  );
  return playerStateService;
}

module.exports = playerStateServiceFactory;
