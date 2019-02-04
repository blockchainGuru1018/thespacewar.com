const TheShade = require('../../../shared/card/TheShade.js');

module.exports = function (events) {
    return events.filter(e => e.type === 'attack' && e.cardCommonId === TheShade.CommonId);
};