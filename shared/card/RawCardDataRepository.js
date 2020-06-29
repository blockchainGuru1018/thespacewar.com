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
                console.error('Failed updating cache, using the current cache instead. This was the reason it failed:\n\t"' + err.message + '"');
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
        const cardData = await getCardData();
        if (!isValidCardData(cardData)) {
            throw new Error('Either the service may be down or the new card format is invalid JSON')
        }

        if (newDataIsDifferentFromCurrent(cardData)) {
            const newCacheData = createCacheData(cardData);
            cacheData = newCacheData;
            const cacheDataJson = JSON.stringify(newCacheData, null, 4);
            await cache.setItem('rawCardData', cacheDataJson);
        }
    }

    function isValidCardData(data) {
        try {
            if (typeof data === 'object') {
                JSON.stringify(data);
            } else {
                JSON.parse(data);
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    function newDataIsDifferentFromCurrent(cardData) {
        if (!cacheData) return true;

        const cacheDataJson = JSON.stringify(cacheData.data, null, 4);
        const freshDataJson = JSON.stringify(cardData, null, 4);
        return cacheDataJson !== freshDataJson;
    }

    function createCacheData(cardData) {
        return {
            data: cardData,
            saveTime: Date.now()
        };
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
