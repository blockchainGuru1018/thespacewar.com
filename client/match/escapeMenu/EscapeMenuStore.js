module.exports = function () {
    return {
        namespaced: true,
        name: 'escapeMenu',
        state: {
            visible: false
        },
        actions: {
            show,
            hide
        }
    };

    function show({ state }) {
        state.visible = true;
    }

    function hide({ state }) {
        state.visible = false;
    }
};
