module.exports = function (deps) {

    const {
        rootStore,
        cardInfoRepository
    } = deps;

    return {
        name: 'requirement',
        namespaced: true,
        state: {
            selectedStationCardIdsForRequirement: []
        },
        getters: {
            waitingForOtherPlayerToFinishRequirements,
            firstRequirement,
            firstRequirementIsDiscardCard,
            firstRequirementIsDamageStationCard,
            firstRequirementIsDrawCard,
            countInFirstRequirement,
            selectedCardsCount,
            cardsLeftToSelect,
            requirementCardImageUrl
        },
        actions: {
            selectStationCardForRequirement
        }
    };

    function waitingForOtherPlayerToFinishRequirements(state, getters, rootState) {
        return rootState.match.requirements.some(r => r.waiting);
    }

    function firstRequirement(state, getters, rootState) {
        const requirements = rootState.match.requirements.slice();

        if (requirements.length === 0) return null;
        return requirements[0];
    }

    function firstRequirementIsDiscardCard(state, getters) {
        return getters.firstRequirement
            && getters.firstRequirement.type === 'discardCard';
    }

    function firstRequirementIsDamageStationCard(state, getters) {
        return getters.firstRequirement
            && getters.firstRequirement.type === 'damageStationCard';
    }

    function firstRequirementIsDrawCard(state, getters) {
        return getters.firstRequirement
            && getters.firstRequirement.type === 'drawCard';
    }

    function countInFirstRequirement(state, getters) {
        return getters.firstRequirement
            && getters.firstRequirement.count;
    }

    function selectedCardsCount(state, getters) {
        return getters.firstRequirementIsDamageStationCard
            ? state.selectedStationCardIdsForRequirement.length
            : 0;
    }

    function cardsLeftToSelect(state, getters) {
        return getters.countInFirstRequirement - getters.selectedCardsCount;
    }

    function requirementCardImageUrl(state, getters) {
        const firstRequirement = getters.firstRequirement;
        if (!firstRequirement || !firstRequirement.cardCommonId) return '';
        return cardInfoRepository.getImageUrl(firstRequirement.cardCommonId);
    }

    function selectStationCardForRequirement({ state, getters }, stationCard) {
        state.selectedStationCardIdsForRequirement.push(stationCard.id);
        if (getters.cardsLeftToSelect === 0) {
            const targetIds = state.selectedStationCardIdsForRequirement.slice();
            state.selectedStationCardIdsForRequirement = [];

            rootStore.dispatch('match/damageStationCards', targetIds);
        }
    }
}