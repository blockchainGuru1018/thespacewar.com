module.exports = function ({ matchController }) {
    return {
        name: "counterAttack",
        namespaced: true,
        state: {},
        getters: {
            requirement,
            attacks,
            findIndexOfAttackInRequirement,
        },
        actions: {
            cancel,
            selectAttack,
        },
    };

    function requirement(state, getters, rootState, rootGetters) {
        const firstRequirement = rootGetters["requirement/firstRequirement"];
        const isCounterAttackRequirement =
            firstRequirement && firstRequirement.type === "counterAttack";
        if (isCounterAttackRequirement) {
            return firstRequirement;
        }
        return null;
    }

    function attacks(state, getters) {
        const requirement = getters.requirement;
        if (!requirement) return [];

        return requirement.attacks;
    }

    function findIndexOfAttackInRequirement(state, getters) {
        return ({ attackerCardData, defenderCardsData, time }) => {
            return getters.attacks.findIndex((attack) => {
                return (
                    attack.attackerCardData.id === attackerCardData.id &&
                    attack.defenderCardsData.every((aCardData) =>
                        defenderCardsData.some(
                            (bCardData) => bCardData.id === aCardData.id
                        )
                    ) &&
                    attack.time === time
                );
            });
        };
    }

    function cancel({ getters }) {
        matchController.emit("cancelCounterAttack", {
            cardId: getters.requirement.cardId,
        });
    }

    function selectAttack({ getters }, attack) {
        matchController.emit("counterAttack", {
            attackIndex: getters.findIndexOfAttackInRequirement(attack),
        });
    }
};
