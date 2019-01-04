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
            waitingForOtherPlayerToFinishRequirements,
            canMoveCardsFromHand,
            canDiscardCards,
            canPutDownCards,
            canPutDownStationCards,
            canSelectStationCards,
            canMoveStationCards,
            canDrawCards
        },
        actions: {}
    }

    function isOwnTurn(state, getters, rootState) {
        const matchState = rootState.match;
        return matchState.ownUser.id === matchState.currentPlayer;
    }

    function waitingForOtherPlayerToFinishRequirements() {
        return getFrom('waitingForOtherPlayerToFinishRequirements', 'requirement');
    }

    function canMoveCardsFromHand(state, getters) {
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        const hasActiveRequirement = !!getFrom('firstRequirement', 'requirement');
        return getters.isOwnTurn
            || hasActiveRequirement;
    }

    function canDiscardCards(state, getters, rootState) {
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        const hasRequirement = !!getFrom('firstRequirement', 'requirement');
        if (hasRequirement) {
            return getFrom('firstRequirementIsDiscardCard', 'requirement');
        }
        else {
            const phase = rootState.match.phase;
            return phase === 'action' || phase === 'discard';
        }
    }

    function canPutDownCards(state, getters, rootState) {
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        const hasRequirement = !!getFrom('firstRequirement', 'requirement');
        const isActionPhase = rootState.match.phase === 'action'
        return getters.isOwnTurn
            && isActionPhase
            && !hasRequirement;
    }

    function canPutDownStationCards(state, getters, rootState) {
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        const matchState = rootState.match;
        const hasAlreadyPutDownStationCard = matchState.events.some(e => {
            return e.turn === matchState.turn
                && e.type === 'putDownCard'
                && e.location.startsWith('station');
        })
        const hasRequirement = !!getFrom('firstRequirement', 'requirement');
        return matchState.phase === 'action'
            && !hasAlreadyPutDownStationCard
            && !hasRequirement;
    }

    function canMoveStationCards(state, getters) {
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        const hasRequirement = !!getFrom('firstRequirement', 'requirement');
        return !hasRequirement;
    }

    function canSelectStationCards(state, getters) {
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        const firstRequirementIsDamageOwnStationCard = getFrom('firstRequirementIsDamageOwnStationCard', 'requirement');
        const cardsLeftToSelect = getFrom('cardsLeftToSelect', 'requirement');
        return firstRequirementIsDamageOwnStationCard && cardsLeftToSelect > 0;
    }

    function canDrawCards(state, getters, rootState) {
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        return rootState.match.phase === 'draw'
            || getFrom('firstRequirementIsDrawCard', 'requirement');
    }
}