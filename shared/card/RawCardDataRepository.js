const cardsJson = require('../../server/card/cards.json');

const HOURS_12 = 12 * 60 * 60 * 1000;
module.exports = function ({ ajax }) {

    let cache = getCacheOrNull();

    return {
        init,
        get
    };

    async function init() {
        if (!cache || cacheIsTooOld()) {
            clearCache();
            await updateCache();
        }
    }

    function get() {
        if (!cache) throw new Error('Trying to get card data before it has finished downloading.');
        return cache;
    }

    function cacheIsTooOld() {
        const timeSinceCached = Date.now() - cache.saveTime;
        return timeSinceCached > HOURS_12;
    }

    async function updateCache() {
        let data = await downloadCardData();
        cache = { data, saveTime: Date.now() };
        localStorage.setItem('rawCardData', JSON.stringify(cache));
    }

    async function downloadCardData() {
        try {
            return await ajax.get('https://admin.thespacewar.com/services/api/cards');
        } catch (err) {
            console.error(err);
            console.error('Failed downloading cards JSON data, using backup.');
            return cardsJson;
        }
    }

    function getCacheOrNull() {
        const cacheJson = localStorage.getItem('rawCardData');
        if (cacheJson) {
            return JSON.parse(cacheJson);
        }
        else {
            return null;
        }
    }

    function clearCache() {
        localStorage.removeItem('rawCardData');
        cache = null;
    }
};