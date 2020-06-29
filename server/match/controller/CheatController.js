const CardDataAssembler = require('../../../shared/CardDataAssembler.js');
const CheatFactory = require('../cheat/CheatFactory.js');

function CheatController(deps) {

    const {
        rawCardDataRepository,
        logger
    } = deps;

    const cardDataAssembler = CardDataAssembler({ rawCardDataRepository });
    const cheatFactory = CheatFactory({ ...deps, cardDataAssembler });

    return {
        onCheat
    };

    function onCheat(playerId, { type, data }) {
        logger.log(`[CHEAT BY PLAYER ${playerId}] Type "${type}" with data: ${JSON.stringify(data)}`, 'cheat');

        const cheat = cheatFactory.fromType(type);
        return cheat.forPlayerWithData(playerId, data);
    }
}

module.exports = CheatController;