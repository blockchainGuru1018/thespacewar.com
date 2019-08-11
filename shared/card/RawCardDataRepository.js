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
        let data = await getCardData();

        const cacheDataJson = JSON.stringify(cacheData.data, null, 4);
        const freshDataJson = JSON.stringify(data, null, 4);
        if (freshDataJson !== cacheDataJson) {
            saveNewCacheData(data);
            await cache.setItem('rawCardData', cacheData);
        }
    }

    function saveNewCacheData(newData) {
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