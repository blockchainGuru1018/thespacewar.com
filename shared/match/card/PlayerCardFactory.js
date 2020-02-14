module.exports = function ({
    playerStateService,
    cardFactory
}) {
    return {
        fromId
    };

    function fromId(cardId) {
        const cardData = playerStateService.findCardFromAnySource(cardId);
        return cardFactory.createCardForPlayer(cardData, playerStateService.getPlayerId());
    }
};
