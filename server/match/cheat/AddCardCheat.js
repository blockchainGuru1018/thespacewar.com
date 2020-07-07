module.exports = function ({ cardDataAssembler, playerServiceFactory }) {
    return {
        getType: () => "addCard",
        forPlayerWithData,
    };

    function forPlayerWithData(
        playerId,
        { count, commonId, playerCheatedId = null }
    ) {
        const playerStateService = playerServiceFactory.playerStateService(
            playerCheatedId ? playerCheatedId : playerId
        );
        const cardCount = Math.min(count, 10);
        for (let i = 0; i < cardCount; i++) {
            const cardData = cardDataAssembler.createFromCommonId(commonId);
            playerStateService.addCardToHand(cardData);
        }
    }
};
