module.exports = function ({
    playerServiceProvider,
    cardDataAssembler
}) {

    return {
        getType: () => 'addCard',
        forPlayerWithData
    };

    function forPlayerWithData(playerId, { count, commonId }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cardCount = Math.min(count, 10);
        for (let i = 0; i < cardCount; i++) {
            const cardData = cardDataAssembler.createFromCommonId(commonId);
            playerStateService.addCardToHand(cardData);
        }
    }
};