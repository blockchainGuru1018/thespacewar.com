module.exports = function ({
    playerStateService,
    cardFactory
}) {
    return {
        fromId,
        fromData
    };

    function fromId(cardId) {
        const cardData = playerStateService.findCardFromAnySource(cardId);
        return fromData(cardData);
    }

    function fromData(cardData) {
        return cardFactory.createCardForPlayer(cardData, playerStateService.getPlayerId());
    }
};
