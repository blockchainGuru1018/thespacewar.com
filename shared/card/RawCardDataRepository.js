const cardsJson = require('../../server/card/cards.json');

const HOURS_12 = 12 * 60 * 60 * 1000;
module.exports = function ({ ajax, cache = DummyCache() }) {

    let cacheData = getCacheOrNull();

    return {
        init,
        get
    };

    async function init() {
        if (!cacheData || cacheIsTooOld()) {
            clearCache();
            await updateCache();
        }
    }

    function get() {
        if (!cacheData) throw new Error('Trying to get card data before it has finished downloading.');
        return cacheData.data;
    }

    function cacheIsTooOld() {
        const timeSinceCached = Date.now() - cacheData.saveTime;
        return timeSinceCached > HOURS_12;
    }

    async function updateCache() {
        let data = await downloadCardData();
        cacheData = { data, saveTime: Date.now() };
        cache.setItem('rawCardData', JSON.stringify(cacheData));
    }

    async function downloadCardData() {
        try {
            const url = 'https://admin.thespacewar.com/services/api/cards';
            console.log('Gettings fresh cards JSON from:', url);
            const response = await ajax.get(url);
            return response.data;
        } catch (err) {
            console.error(err);
            console.error('Failed downloading cards JSON data, using backup.');
            return cardsJson;
        }
    }

    function getCacheOrNull() {
        const cacheJson = cache.getItem('rawCardData');
        if (cacheJson) {
            return JSON.parse(cacheJson);
        }
        else {
            return null;
        }
    }

    function clearCache() {
        cache.removeItem('rawCardData');
        cacheData = null;
    }
};

function DummyCache() {
    return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    };
}