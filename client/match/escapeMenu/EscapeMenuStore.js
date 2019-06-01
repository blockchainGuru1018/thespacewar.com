module.exports = function () {
    return {
        namespaced: true,
        name: 'escapeMenu',
        state: {
            visible: false
        },
        actions: {
            toggleVisible,
            show,
            hide
        }
    };

    function toggleVisible({ state }) {
        state.visible = !state.visible;
    }

    function show({ state }) {
        state.visible = true;
    }

    function hide({ state }) {
        state.visible = false;
    }
};
