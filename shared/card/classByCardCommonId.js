const cardsJson = require('../../server/card/cards.json');

const filesById = {};
for (let cardJson of cardsJson) {
    try {
        filesById[cardJson.id] = require(`./${toPascalCase(cardJson.name)}.js`);
    }
    catch (err) {
    }
}

module.exports = filesById;

function toPascalCase(word) {
    return word.match(/[a-z]+/gi)
        .map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
        .join('');
}