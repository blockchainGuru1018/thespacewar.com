module.exports = function ({ playerStateService, cardFactory }) {
    return {
        fromId,
        fromData,
    };

    function fromId(cardId) {
        const cardData = playerStateService.findCardFromAnySource(cardId);
        if (!cardData) throw new Error("PlayerCardFactory cannot find card");

        return fromData(cardData);
    }

    function fromData(cardData) {
        return cardFactory.createCardForPlayer(
            cardData,
            playerStateService.getPlayerId()
        );
    }
};
