const axios = require('axios');
const RawCardDataRepository = require('../../shared/card/RawCardDataRepository.js');

module.exports = function () {
    return RawCardDataRepository({ ajax: axios });
}