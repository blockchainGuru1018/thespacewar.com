const FrankJohnsonConfig = require('./config/FrankJohnsonConfig.json');

module.exports = function () {
    return {
        maxStationCards: () => FrankJohnsonConfig.maxStationCards
    };
};
