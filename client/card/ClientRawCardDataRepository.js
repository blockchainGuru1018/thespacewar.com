const ajax = require('../utils/ajax.js');
const RawCardDataRepository = require('../../shared/card/RawCardDataRepository.js');

module.exports = function () {
    return RawCardDataRepository({
        getCardData: () => ajax.get(`/card/data`),
        cache: localStorage
    });
}