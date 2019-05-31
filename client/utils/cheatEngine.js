const ajax = require('./ajax.js');
const localGameDataFacade = require('./localGameDataFacade.js');

window.cheat = function (type, data) {
    if (type === 'test_findCard') {
        addCardsInDeckAsFindCardRequirement();
    }
    else {
        sendCheatAndLogResult(type, data);
    }
};

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
    let ownUser = localGameDataFacade.getOwnUser();
    let ongoingMatch = localGameDataFacade.getOngoingMatch();
    let password = localGameDataFacade.DebugPassword.get();

    return await ajax.jsonPost('/cheat', {
        type,
        data,
        password,
        playerId: ownUser.id,
        matchId: ongoingMatch.id
    });
}
