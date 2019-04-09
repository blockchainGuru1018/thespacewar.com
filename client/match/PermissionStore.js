const canIssueOverwork = require('../../shared/match/overwork/canIssueOverwork.js');

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
            canPutDownMoreStationCards,
            canSelectStationCards,
            canSelectCardsForActiveAction,
            canMoveStationCards,
            canIssueOverwork: canIssueOverworkGetter,
            canDrawCards,
            canMill,
            deckIsEmpty,
            opponentDeckIsEmpty
        },
        actions: {}
    };

    function isOwnTurn(state, getters, rootState) {
        const matchState = rootState.match;
        return matchState.ownUser.id === matchState.currentPlayer;
    }

    function waitingForOtherPlayerToFinishRequirements() {
        return getFrom('waitingForOtherPlayerToFinishRequirements', 'requirement');
    }

    function deckIsEmpty() {
        let playerCardsInDeckCount = getFrom('playerCardsInDeckCount', 'match');
        return playerCardsInDeckCount <= 0;
    }

    function opponentDeckIsEmpty() {
        let opponentCardsInDeckCount = getFrom('opponentCardsInDeckCount', 'match');
        return opponentCardsInDeckCount <= 0;
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
        const hasRequirement = !!getFrom('firstRequirement', 'requirement');
        if (hasRequirement) return false;

        return rootState.match.phase === 'action';
    }

    function canPutDownMoreStationCards(state, getters, rootState, rootGetters) {
        const playerStateService = rootGetters['match/playerStateService'];
        return playerStateService.canPutDownMoreStationCards();
    }

    function canMoveStationCards(state, getters, rootState) { //TODO This will collide with the ability to "move station cards between rows". This method is talking about moving it to the home zone, perhaps "playing station card"
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        const hasActiveAction = rootState.card.activeAction;
        const hasRequirement = !!getFrom('firstRequirement', 'requirement');
        return !hasActiveAction
            && !hasRequirement;
    }

    function canIssueOverworkGetter(state, getters, rootState, rootGetters) {
        return canIssueOverwork({
            unflippedStationCardCount: rootGetters['match/playerUnflippedStationCardCount'],
            phase: rootState.match.phase,
            hasRequirements: rootState.match.requirements.length > 0
        });
    }

    function canSelectStationCards(state, getters) { //TODO Rename "canSelectStationCardsForRequirement"
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        const damageStationCardRequirement = getFrom('firstRequirementIsDamageStationCard', 'requirement');
        const cardsLeftToSelect = getFrom('cardsLeftToSelect', 'requirement');
        return damageStationCardRequirement && cardsLeftToSelect > 0;
    }

    function canSelectCardsForActiveAction(state, getters, rootState) { //TODO This and the ones who use this might have to support this action for both opponent and player cards
        const activeAction = rootState.card.activeAction;
        if (!activeAction) return false;

        return ['destroyAnyCard', 'sacrifice'].includes(activeAction.name);
    }

    function canDrawCards(state, getters, rootState) {
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        let isDrawPhaseOrHasDrawCardRequirement = rootState.match.phase === 'draw'
            || getFrom('firstRequirementIsDrawCard', 'requirement');
        if (!isDrawPhaseOrHasDrawCardRequirement) return false;

        if (getters.deckIsEmpty) {
            return getters.opponentDeckIsEmpty;
        }
        else {
            return true;
        }
    }

    function canMill(state, getters, rootState) {
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;
        if (getters.opponentDeckIsEmpty) return false;

        return rootState.match.phase === 'draw'
            || getFrom('firstRequirementIsDrawCard', 'requirement');
    }
};