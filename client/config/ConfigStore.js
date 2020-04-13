module.exports = function ({configRepository}) {

    return {
        namespaced: true,
        name: 'config',
        state: {
            config: {}
        },
        actions: {
            init
        }
    };

    /**
     * @param state
     * @returns {Promise<void>}
     * @description add default access-key for testing
     */
    async function init({state}) {
        state.config = await configRepository.getConfiguration();
    }
};