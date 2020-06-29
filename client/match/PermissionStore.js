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
            opponentHasControlOfPlayersTurn,
            playerHasControlOfOpponentsTurn,
            waitingForOtherPlayerToFinishRequirements,
            canMoveCardsFromHand,
            canDiscardCards,
            canDiscardActivateDurationCards,
            canReplaceCards,
            canPutDownCards,
            canPutDownStationCards,
            canPutDownMoreStationCardsThisTurn,
            canPutDownMoreStartingStationCards,
            canSelectStationCards,
            canSelectCardsForActiveAction,
            canPutDownStationCardInHomeZone,
            canIssueOverwork: canIssueOverworkGetter,
            canDrawCards,
            canPassDrawPhase,
            canMill,
            deckIsEmpty,
            opponentDeckIsEmpty
        },
        actions: {}
    };

    function isOwnTurn(state, getters, rootState) { //TODO "isOwnTurn" is confusing as you can take control of another players turn, this would be true then but it wouldnt be "your turn".
        const matchState = rootState.match;
        return matchState.ownUser.id === matchState.currentPlayer;
    }

    function opponentHasControlOfPlayersTurn(state, getters, rootState, rootGetters) {
        return rootGetters['match/turnControl'].opponentHasControlOfPlayersTurn();
    }

    function playerHasControlOfOpponentsTurn(state, getters, rootState, rootGetters) {
        return rootGetters['match/turnControl'].playerHasControlOfOpponentsTurn();
    }

    function waitingForOtherPlayerToFinishRequirements() {
        return getFrom('waitingForOtherPlayerToFinishRequirements', 'requirement');
    }

    function deckIsEmpty(state, getters, rootState) {
        return rootState.match.playerCardsInDeckCount <= 0;
    }

    function opponentDeckIsEmpty(state, getters, rootState) {
        return rootState.match.opponentCardsInDeckCount <= 0;
    }

    function canMoveCardsFromHand(state, getters, rootState, rootGetters) {
        if (getters.canPutDownMoreStartingStationCards) return true;
        if (getters.waitingForOtherPlayerToFinishRequirements) return false;

        const hasActiveRequirement = !!getFrom('firstRequirement', 'requirement');
        return !rootGetters['match/gameOn']
            || getters.isOwnTurn
            || hasActiveRequirement;
    }

    function canDiscardCards(state, getters, rootState, rootGetters) {
        return rootGetters['match/playerRuleService'].canDiscardCards();
    }

    function canDiscardActivateDurationCards(state, getters, rootState, rootGetters) {
        return rootGetters['match/playerRuleService'].canDiscardActivateDurationCards();
    }

    function canReplaceCards(state, getters, rootState, rootGetters) {
        return rootGetters['match/playerRuleService'].canReplaceCards();
    }

    function canPutDownCards(state, getters, rootState, rootGetters) {
        return rootGetters['match/playerRuleService'].canPutDownCardsInHomeZone();
    }

    function canPutDownStationCards(state, getters, rootState, rootGetters) {
        return rootGetters['match/playerRuleService'].canPutDownStationCards();
    }

    function canPutDownMoreStationCardsThisTurn(state, getters, rootState, rootGetters) {
        return rootGetters['match/playerRuleService'].canPutDownMoreStationCardsThisTurn();
    }

    function canPutDownMoreStartingStationCards(state, getters, rootState, rootGetters) {
        return rootGetters['match/playerRuleService'].canPutDownMoreStartingStationCards();
    }

    function canPutDownStationCardInHomeZone(state, getters, rootState, rootGetters) {
        return rootGetters['match/playerRuleService'].canPutDownCardsInHomeZone()
            && !rootState.card.activeAction;
    }

    function canIssueOverworkGetter(state, getters, rootState, rootGetters) {
        return rootGetters['match/overworkEnabled']
            && canIssueOverwork({
                playerId: rootState.match.ownUser.id,
                currentPlayer: rootState.match.currentPlayer,
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

    function canSelectCardsForActiveAction(state, getters, rootState) {
        const activeAction = rootState.card.activeAction;
        if (!activeAction) return false;

        return ['destroyAnyCard', 'sacrifice'].includes(activeAction.name);
    }

    function canDrawCards(state, getters, rootState, rootGetters) {
        return rootGetters['match/playerRuleService'].canDrawCards();
    }

    function canPassDrawPhase(state, getters, rootState, rootGetters) {
        return rootGetters['match/playerDrawPhase'].canPass();
    }

    function canMill(state, getters, rootState, rootGetters) {
        return rootGetters['match/miller'].canMill();
    }
};
