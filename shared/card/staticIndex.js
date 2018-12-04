const BaseCard = require('./BaseCard.js');
const names = BaseCard.names;

module.exports = {
    [names.energyShield]: require('./EnergyShield.js'),
    [names.smallCannon]: require('./SmallCannon.js')
};