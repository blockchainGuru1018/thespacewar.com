module.exports = function (deps) {

    const {
        getFrom
    } = deps;

    return {
        name: 'permission',
        namespaced: true,
        state: {},
        getters: {
            isOwnTurn,
            canMoveCardsFromHand,
            canDiscardCards,
            canPutDownCards
        },
        actions: {}
    }

    function isOwnTurn(state, getters, rootState) {
        const matchState = rootState.match;
        return matchState.ownUser.id === matchState.currentPlayer;
    }

    function canMoveCardsFromHand(state, getters, rootState) {
        const hasActiveRequirement = !!getFrom('latestRequirement', 'requirement');
        return getters.isOwnTurn
            || hasActiveRequirement;
    }

    function canDiscardCards(state, getters, rootState) {
        const phase = rootState.match.phase;
        const inActionOrDiscardPhase = phase === 'action' || phase === 'discard';
        const latestRequirementIsDiscardCard = getFrom('latestRequirementIsDiscardCard', 'requirement');
        return inActionOrDiscardPhase
            || !!latestRequirementIsDiscardCard;
    }

    function canPutDownCards(state, getters) {
        const latestRequirementIsDiscardCard = getFrom('latestRequirementIsDiscardCard', 'requirement');
        return getters.isOwnTurn
            && !latestRequirementIsDiscardCard;
    }
}