const _CardCanBePlacedInStation = require("./CardCanBePlacedInStation.js");

module.exports = function CardFacadeContext({ playerServiceFactory }) {
    return CardFacade;

    function CardFacade(cardId, playerId) {
        const objectsByNameAndPlayerId = {};

        let api;

        api = {
            _cache: objectsByNameAndPlayerId,
            CardCanBePlacedInStation: cached(CardCanBePlacedInStation),
        };

        return api;

        function CardCanBePlacedInStation() {
            return _CardCanBePlacedInStation({
                card: card(),
                playerStateService: playerServiceFactory.playerStateService(
                    playerId
                ),
                playerRuleService: playerServiceFactory.playerRuleService(
                    playerId
                ),
            });
        }

        function card() {
            const cardFactory = playerServiceFactory.cardFactory(playerId);
            const cardData = getCardData();
            return cardFactory.createCardForPlayer(cardData, playerId);
        }

        function getCardData() {
            return playerServiceFactory
                .playerStateService(playerId)
                .findCardFromAnySource(cardId);
        }

        function cached(constructor) {
            const name = constructor.name;
            return (playerIdOrUndefined) => {
                const key = name + ":" + playerIdOrUndefined;
                const existingCopy = objectsByNameAndPlayerId[key];
                if (existingCopy) return existingCopy;

                const result = constructor(playerIdOrUndefined);
                objectsByNameAndPlayerId[key] = result;
                return result;
            };
        }
    }
};
