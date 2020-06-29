module.exports = function StatePreparer({ whitelist, obscureHandlerByKey, alternateItemNames = null }) {

    return {
        prepare
    };

    function prepare(state, context = {}) {
        const result = {};
        const whitelistedKeys = Object.keys(state).filter(key => whitelist.includes(key));
        for (const key of whitelistedKeys) {
            const value = state[key];

            const obscurer = obscureHandlerByKey[key];
            if (obscurer) {
                result[getFinalKey(obscurer.key)] = obscurer.obscure(value, context);
            }
            else {
                result[getFinalKey(key)] = value;
            }
        }

        return result;
    }

    function getFinalKey(key) {
        return (alternateItemNames && alternateItemNames[key]) ? alternateItemNames[key] : key;
    }
};
