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

        if (!cacheData || shouldFetchNewCache()) {
            try {
                await updateCacheIfChanged();
            }
            catch (err) {
                console.error('Failed updating cache, using the current cache instead.');
            }
        }
    }

    function get() {
        if (!cacheData) throw new Error('Trying to get card data before it has finished downloading.');
        return cacheData.data;
    }

    function shouldFetchNewCache() {
        if (ALWAYS_UPDATE_CACHE) return true;

        return cacheTooOld();
    }

    function cacheTooOld() {
        const timeSinceCached = Date.now() - cacheData.saveTime;
        return timeSinceCached > HOURS_12;
    }

    async function updateCacheIfChanged() {
        const data = await getCardData();

        if (newDataIsDifferentFromCurrent(data)) {
            saveNewCacheData(data);
            const cacheDataJson = JSON.stringify(cacheData.data, null, 4);
            await cache.setItem('rawCardData', cacheDataJson);
        }
    }

    function newDataIsDifferentFromCurrent(data) {
        if (!cacheData) return true;

        const cacheDataJson = JSON.stringify(cacheData.data, null, 4);
        const freshDataJson = JSON.stringify(data, null, 4);
        return cacheDataJson !== freshDataJson;
    }

    function saveNewCacheData(newData) {
        if (!cacheData) cacheData = {};

        cacheData.data = newData;
        cacheData.saveTime = Date.now();
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
