module.exports = function ({configRepository}) {

    return {
        namespaced: true,
        name: 'config',
        state: {
            useAccessKey: true
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
        const config = await configRepository.getConfiguration();
        state.useAccessKey = config.USE_ACCESS_KEY;
    }
};