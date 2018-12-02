module.exports = function Neutral(deps) {

    const baseCard = deps.card;

    return {
        hasEffectOnStationAttack: () => {
            return false
        },
        getImportanceOnStationAttack: () => {
            return 0
        },
        applyEffectOnStationAttack: (args) => {
            return args;
        }
    };
}