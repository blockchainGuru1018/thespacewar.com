const ajax = require('../utils/ajax.js');
const RawCardDataRepository = require('../../shared/card/RawCardDataRepository.js');

module.exports = function () {
    return RawCardDataRepository({
        ajax,
        cache: localStorage
    });
}