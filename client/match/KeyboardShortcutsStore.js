module.exports = function ({
    rootStore,
    businessLogicExperiment
}) {

    return {
        namespaced: true,
        name: 'keyboardShortcuts',
        actions: {
            init
        }
    };

    function init() {
        window.addEventListener('keydown', onKeyDown);
    }

    function onKeyDown(event) {
        if (event.key === ' ') { //TODO Is event.key available in all relevant browsers?
            businessLogicExperiment.toggleControlOfTurn();
        }
    }
};
