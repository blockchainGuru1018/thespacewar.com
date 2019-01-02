module.exports = function (deps) {

    const {
        rootStore
    } = deps;

    return {
        name: 'requirement',
        namespaced: true,
        state: {
            selectedStationCardIdsForRequirement: []
        },
        getters: {
            waitingForOtherPlayerToFinishRequirements,
            latestRequirement,
            latestRequirementIsDiscardCard,
            latestRequirementIsDamageOwnStationCard,
            latestRequirementIsDrawCard,
            countInLatestRequirement,
            selectedCardsCount,
            cardsLeftToSelect
        },
        actions: {
            selectStationCardForRequirement
        }
    }

    function waitingForOtherPlayerToFinishRequirements(state, getters, rootState) {
        return rootState.match.requirements.some(r => r.waiting);
    }

    function latestRequirement(state, getters, rootState) {
        const requirements = rootState.match.requirements;

        if (requirements.length === 0) return null;
        return requirements[requirements.length - 1];
    }

    function latestRequirementIsDiscardCard(state, getters) {
        return getters.latestRequirement
            && getters.latestRequirement.type === 'discardCard';
    }

    function latestRequirementIsDamageOwnStationCard(state, getters) {
        return getters.latestRequirement
            && getters.latestRequirement.type === 'damageOwnStationCard';
    }

    function latestRequirementIsDrawCard(state, getters) {
        return getters.latestRequirement
            && getters.latestRequirement.type === 'drawCard';
    }

    function countInLatestRequirement(state, getters) {
        return getters.latestRequirement
            && getters.latestRequirement.count;
    }

    function selectedCardsCount(state, getters) {
        return getters.latestRequirementIsDamageOwnStationCard
            ? state.selectedStationCardIdsForRequirement.length
            : 0;
    }

    function cardsLeftToSelect(state, getters) {
        return getters.countInLatestRequirement - getters.selectedCardsCount;
    }

    function selectStationCardForRequirement({ state, getters, dispatch }, stationCard) {
        state.selectedStationCardIdsForRequirement.push(stationCard.id);
        if (getters.cardsLeftToSelect === 0) {
            const targetIds = state.selectedStationCardIdsForRequirement.slice();
            rootStore.dispatch('match/damageOwnStationCards', targetIds);
        }
    }
}