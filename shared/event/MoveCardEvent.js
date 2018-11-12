module.exports = function MoveEvent({ turn, cardId, cardCommonId }) {
    return {
        type: 'moveCard',
        created: new Date().toISOString(),
        turn,
        cardId,
        cardCommonId
    };
}