module.exports = function ({
    matchController
}) {

    return {
        name: 'counterCard',
        namespaced: true,
        state: {},
        getters: {
            requirement,
            cards
        },
        actions: {
            cancel,
            selectCard
        }
    };

    function requirement(state, getters, rootState, rootGetters) {
        const firstRequirement = rootGetters['requirement/firstRequirement'];
        const isCounterCardRequirement = firstRequirement && firstRequirement.type === 'counterCard';
        if (isCounterCardRequirement) {
            return firstRequirement;
        }
        return null;
    }

    function cards(state, getters) {
        const requirement = getters.requirement;
        if (!requirement) return [];

        const opponentAnyCardGroup = requirement.cardGroups.find(g => g.source === 'opponentAny');
        if (!opponentAnyCardGroup) return [];

        return opponentAnyCardGroup.cards;
    }

    function cancel({ getters }) {
        matchController.emit('cancelCounterCard', { cardId: getters.requirement.cardId });
    }

    function selectCard({ getters }, { id }) {
        matchController.emit('counterCard', { cardId: getters.requirement.cardId, targetCardId: id });
    }
};
