const cardsJson = require('./cards.json');

module.exports = function () {

    let initiated = false;

    return {
        init,
        get
    };

    function init() {
        return new Promise(resolve => {
            setTimeout(() => {
                initiated = true;
                resolve();
            }, 3000);
        });
    }

    function get() {
        if (!initiated) throw new Error('Trying to get card data before it has finished downloading.');

        return cardsJson;
    }
};