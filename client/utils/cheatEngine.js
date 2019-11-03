const ajax = require('./ajax.js');
const localGameDataFacade = require('./localGameDataFacade.js');

window.cheat = function (type, data) {
    if (type === 'test_findCard') {
        addCardsInDeckAsFindCardRequirement();
    }
    else if (type === 'master_log') {
        outputMasterLogToConsole();
    }
    else {
        sendCheatAndLogResult(type, data);
    }
};

async function outputMasterLogToConsole() {
    this.log = 'LOADING LOG';
    const { text } = await ajax.jsonPost('/master-log', { password: localGameDataFacade.DebugPassword.get() });
    console.log('\n\n --- MASTER LOG --- ');
    console.log(text);
    console.log(' --- END OF LOG --- \n\n');
}

async function addCardsInDeckAsFindCardRequirement() {
    const cardsInDeck = await sendCheat('getCardsInDeck');
    const result = await sendCheat('addRequirement', {
        type: 'findCard',
        count: 2,
        common: false,
        waiting: false,
        cardGroups: [
            { source: 'deck', cards: cardsInDeck }
        ]
    });

    console.log('CHEAT RESULT', result);
}

async function sendCheatAndLogResult(type, data) {
    const result = await sendCheat(type, data);
    if (result) {
        console.log('CHEAT RESULT', result);
    }
}

async function sendCheat(type, data) {
    const ownUser = localGameDataFacade.getOwnUser();
    const ongoingMatch = localGameDataFacade.getOngoingMatch();
    const password = localGameDataFacade.DebugPassword.get();

    return await ajax.jsonPost('/cheat', {
        type,
        data,
        password,
        playerId: ownUser.id,
        matchId: ongoingMatch.id
    });
}
