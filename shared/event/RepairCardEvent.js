module.exports = function ({ turn, cardId, cardCommonId, repairedCardId, repairedCardCommonId }) {
    return {
        type: 'repairCard',
        created: new Date().toISOString(),
        turn,
        cardId,
        cardCommonId,
        repairedCardId,
        repairedCardCommonId
    };
};