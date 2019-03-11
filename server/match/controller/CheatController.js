const CardDataAssembler = require('../../../shared/CardDataAssembler.js');

function CheatController(deps) {

    const {
        playerServiceProvider,
        rawCardDataRepository,
        logger
    } = deps;

    let cardDataAssembler = CardDataAssembler({ rawCardDataRepository });

    return {
        onCheat
    };

    function onCheat(playerId, { type, data }) {
        logger.log(`[CHEAT BY PLAYER ${playerId}] Type "${type}" with data: ${JSON.stringify(data)}`, 'cheat');

        if (type === 'actionPoints') {
            addActionPoints(playerId, data.actionPointsCount);
        }
        else if (type === 'addCard') {
            addCard(playerId, data);
        }
    }

    function addCard(playerId, data) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cardCount = Math.min(data.count, 10);
        for (let i = 0; i < cardCount; i++) {
            const cardData = cardDataAssembler.createFromCommonId(data.commonId);
            playerStateService.addCardToHand(cardData);
        }
    }

    function addActionPoints(playerId, count) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.storeEvent({ type: 'cheatAddActionPoints', count })
    }
}

module.exports = CheatController;