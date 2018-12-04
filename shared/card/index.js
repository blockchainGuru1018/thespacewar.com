const BaseCard = require('./BaseCard.js');
const names = BaseCard.names;

module.exports = getCardConstructorsByName();

function getCardConstructorsByName() {
    let constructorsByName = {};
    for (let name of Object.values(names)) {
        const filePath = getFilePathForName(name)
        constructorsByName[name] = require(filePath);
    }
    return constructorsByName;
}

function getFilePathForName(name) {
    const fileName = toPascalCase(name) + '.js';
    return `./${fileName}`;
}

function toPascalCase(word) {
    return word.match(/[a-z]+/gi)
        .map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
        .join('')
}