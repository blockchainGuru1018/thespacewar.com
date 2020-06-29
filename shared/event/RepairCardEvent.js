module.exports = function ({ turn, cardId, cardCommonId, repairedCardId, repairedCardCommonId }) {
    return {
        type: 'repairCard',
        created: Date.now(),
        turn,
        cardId,
        cardCommonId,
        repairedCardId,
        repairedCardCommonId
    };
};
