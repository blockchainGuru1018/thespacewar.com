export default function () {
    return {
        namespaced: true,
        name: 'infoMode',
        state: {
            visible: false
        },
        actions: {
            toggle,
            hide
        }
    };

    function toggle({ state }) {
        state.visible = !state.visible;
    }

    function hide({ state }) {
        state.visible = false;
    }
}
