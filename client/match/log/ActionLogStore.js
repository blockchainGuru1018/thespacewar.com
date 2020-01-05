export default function () {
    return {
        namespaced: true,
        name: 'actionLog',
        state: {
            expanded: true
        },
        actions: {
            toggleExpanded,
            collapse
        }
    };

    function toggleExpanded({ state }) {
        state.expanded = !state.expanded;
    }

    function collapse({ state }) {
        state.expanded = false;
    }
};
