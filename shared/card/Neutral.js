module.exports = function Neutral(deps) {
    //TODO Can this class be removed?

    const baseCard = deps.card;

    return {
        hasEffectOnStationAttack: () => {
            return false;
        },
        getImportanceOnStationAttack: () => {
            return 0;
        },
        applyEffectOnStationAttack: (args) => {
            return args;
        },
    };
};
