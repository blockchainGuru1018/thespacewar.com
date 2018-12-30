module.exports = function (deps) {

    const {
        rootStore
    } = deps;

    return {
        name: 'requirement',
        namespaced: true,
        state: {},
        getters: {
            waitingForOtherPlayerToFinishRequirements,
            latestRequirement,
            latestRequirementIsDiscardCard
        },
        actions: {}
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
        return getters.latestRequirement && getters.latestRequirement.type === 'discardCard';
    }
}