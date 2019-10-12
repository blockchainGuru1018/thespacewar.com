module.exports = function () {
    return {
        namespaced: true,
        name: 'escapeMenu',
        state: {
            view: 'main',
            visible: false
        },
        actions: {
            toggleVisible,
            selectView,
            show,
            hide,
        }
    };

    function toggleVisible({ state }) {
        state.visible = !state.visible;
    }

    function selectView({ state }, viewName) {
        state.view = viewName;
    }

    function show({ state }) {
        state.visible = true;
    }

    function hide({ state }) {
        state.visible = false;
    }
};
