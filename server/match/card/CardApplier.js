const PutDownNotImplementedEventCard = require('./putDown/PutDownNotImplementedEventCard.js');
const Commands = [
    require('./putDown/PutDownSupernova.js'),
    require('./putDown/PutDownExcellentWork.js'),
    require('./putDown/PutDownGrandOpportunity.js'),
    require('./putDown/PutDownDiscovery.js'),
    require('./putDown/PutDownFatalError.js'),
    require('./putDown/PutDownLuck.js'),
    require('./putDown/PutDownTheDarkDestroyer.js')
];

module.exports = function CardApplier(deps) {

    const putDownNotImplementedEventCard = PutDownNotImplementedEventCard(deps);
    const commandsByCommonId = {};

    for (const Command of Commands) {
        commandsByCommonId[Command.CommonId] = Command(deps);
    }

    return {
        hasCommandForCard,
        putDownCard
    };

    function hasCommandForCard({ commonId }) {
        return getCommandForCard({ commonId });
    }

    function putDownCard(playerId, cardData, { choice = '' } = {}) {
        const command = getCommandForCard(cardData);
        if (command) {
            command.forPlayer(playerId, cardData, { choice });
        }
        else {
            putDownNotImplementedEventCard.forPlayer(playerId, cardData);
        }
    }

    function getCommandForCard({ commonId }) {
        return commandsByCommonId[commonId];
    }
};
