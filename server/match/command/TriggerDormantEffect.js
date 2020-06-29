module.exports = function ({ playerStateService, canThePlayer }) {
    return cardId => {
        const card = playerStateService.createBehaviourCardById(cardId);
        if (canThePlayer.triggerCardsDormantEffect(card)) {
            card.triggerDormantEffect();
        }
    };
};
