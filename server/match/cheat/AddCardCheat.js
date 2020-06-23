module.exports = function ({
    playerServiceProvider,
    cardDataAssembler
}) {

    return {
        getType: () => 'addCard',
        forPlayerWithData
    };

    function forPlayerWithData(playerId, { count, commonId, playerCheatedId = null }) {
        const playerStateService = playerServiceProvider.getStateServiceById(
            playerCheatedId ? playerCheatedId : playerId
          );
        const cardCount = Math.min(count, 10);
        for (let i = 0; i < cardCount; i++) {
            const cardData = cardDataAssembler.createFromCommonId(commonId);
            playerStateService.addCardToHand(cardData);
        }
    }
};