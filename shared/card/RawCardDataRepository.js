const ALWAYS_UPDATE_CACHE = true; //Set to true mainly for development purposes
const HOURS_12 = 12 * 60 * 60 * 1000;

module.exports = function ({ getCardData, cache = DummyCache() }) {

    let cacheData = null;

    return {
        init,
        get
    };

    async function init() {
        cacheData = await getCacheOrNull();

        if (!cacheData || cacheIsTooOld()) {
            try {
                await updateCache();
            } catch (err) {
                console.error('Failed updating cache, using the current cache instead.');
            }
        }
    }

    function get() {
        if (!cacheData) throw new Error('Trying to get card data before it has finished downloading.');
        return cacheData.data;
    }

    function cacheIsTooOld() {
        if (ALWAYS_UPDATE_CACHE) return true;

        const timeSinceCached = Date.now() - cacheData.saveTime;
        return timeSinceCached > HOURS_12;
    }

    async function updateCache() {
        let data = await getCardData();

        cacheData = { data, saveTime: Date.now() };
        await cache.setItem('rawCardData', JSON.stringify(cacheData, null, 4));
    }

    async function getCacheOrNull() {
        const cacheJson = await cache.getItem('rawCardData');
        if (cacheJson) {
            return JSON.parse(cacheJson);
        }
        else {
            return null;
        }
    }
};

function DummyCache() {
    return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    };
}