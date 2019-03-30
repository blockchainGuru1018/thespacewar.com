const PutDownNotImplementedEventCard = require('./putDown/PutDownNotImplementedEventCard.js');
const Commands = [
    require('./putDown/PutDownSupernova.js'),
    require('./putDown/PutDownExcellentWork.js'),
    require('./putDown/PutDownGrandOpportunity.js'),
    require('./putDown/PutDownDiscovery.js'),
    require('./putDown/PutDownFatalError.js'),
    require('./putDown/PutDownMissilesLaunched.js'),
    require('./putDown/PutDownPerfectPlan.js')
];

module.exports = function CardApplier(deps) {

    const putDownNotImplementedEventCard = PutDownNotImplementedEventCard(deps);
    const commandsByCommonId = {};

    for (const Command of Commands) {
        commandsByCommonId[Command.CommonId] = Command(deps);
    }

    return {
        putDownEventCard
    };

    function putDownEventCard(playerId, cardData, { choice = '' } = {}) {
        let command = getCommandForCard(cardData);
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