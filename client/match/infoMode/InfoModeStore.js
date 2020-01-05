export default function ({
    rootDispatch
}) {
    return {
        namespaced: true,
        name: 'infoMode',
        state: {
            visible: false
        },
        actions: {
            _setVisibility,
            toggle,
            hide
        }
    };

    function _setVisibility({ state }, visible) {
        if (visible) {
            collapseActionLog();
        }
        state.visible = visible;
    }

    function toggle({ state, dispatch }) {
        dispatch('_setVisibility', !state.visible);
    }

    function hide({ dispatch }) {
        dispatch('_setVisibility', false);
    }

    function collapseActionLog() {
        rootDispatch.actionLog.collapse();
    }
}
