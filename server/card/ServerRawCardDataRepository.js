const axios = require('axios');
const RawCardDataRepository = require('../../shared/card/RawCardDataRepository.js');

module.exports = () => RawCardDataRepository({ ajax: axios });