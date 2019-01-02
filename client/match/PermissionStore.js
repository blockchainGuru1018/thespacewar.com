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

    function canMoveCardsFromHand(state, getters, rootState) {
        const hasActiveRequirement = !!getFrom('latestRequirement', 'requirement');
        return getters.isOwnTurn
            || hasActiveRequirement;
    }

    function canDiscardCards(state, getters, rootState) {
        const hasRequirement = !!getFrom('latestRequirement', 'requirement');
        if (hasRequirement) {
            return getFrom('latestRequirementIsDiscardCard', 'requirement');
        }
        else {
            const phase = rootState.match.phase;
            return phase === 'action' || phase === 'discard';
        }
    }

    function canPutDownCards(state, getters, rootState) {
        const hasRequirement = !!getFrom('latestRequirement', 'requirement');
        const isActionPhase = rootState.match.phase === 'action'
        return getters.isOwnTurn
            && isActionPhase
            && !hasRequirement;
    }

    function canPutDownStationCards(state, getters, rootState) {
        const matchState = rootState.match;
        const hasAlreadyPutDownStationCard = matchState.events.some(e => {
            return e.turn === matchState.turn
                && e.type === 'putDownCard'
                && e.location.startsWith('station');
        })
        const hasRequirement = !!getFrom('latestRequirement', 'requirement');
        return matchState.phase === 'action'
            && !hasAlreadyPutDownStationCard
            && !hasRequirement;
    }

    function canMoveStationCards(state, getters, rootState) {
        const hasRequirement = !!getFrom('latestRequirement', 'requirement');
        return !hasRequirement;
    }

    function canSelectStationCards() {
        const latestRequirementIsDamageOwnStationCard = getFrom('latestRequirementIsDamageOwnStationCard', 'requirement');
        const cardsLeftToSelect = getFrom('cardsLeftToSelect', 'requirement');
        return latestRequirementIsDamageOwnStationCard && cardsLeftToSelect > 0;
    }

    function canDrawCards(state, getters, rootState) {
        return rootState.match.phase === 'draw'
            || getFrom('latestRequirementIsDrawCard', 'requirement');
    }
}