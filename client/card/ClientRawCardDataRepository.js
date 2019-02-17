const cardsJson = require('../../server/card/cards.json');

module.exports = function () {

    const cacheJson = localStorage.getItem('rawCardData')
    let initiated = !!cacheJson ? JSON.parse(cacheJson) : false;

    return {
        init,
        get
    };

    function init() {
        return new Promise(resolve => {
            setTimeout(() => {
                initiated = true;
                localStorage.setItem('rawCardData', '[]');
                resolve();
            }, 3000);
        });
    }

    function get() {
        if (!initiated) throw new Error('Trying to get card data before it has finished downloading.');

        return cardsJson;
    }
};