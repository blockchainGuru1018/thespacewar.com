const ajax = require('../utils/ajax.js');
const RawCardDataRepository = require('../../shared/card/RawCardDataRepository.js');

module.exports = () => RawCardDataRepository({ ajax });