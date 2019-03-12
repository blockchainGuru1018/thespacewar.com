const ajax = require('./ajax.js');
const localGameDataFacade = require('./localGameDataFacade.js');

window.cheat = function (text) {
    if (text.startsWith('addCard')) {
        addCard(text.slice('addCard'.length));
    }

    if (text.startsWith('actionPoints')) {
        actionPoints(text.slice('actionPoints'.length));
    }
};

function addCard(text) {
    const [commonId, countText] = text.trim().split(',').map(s => s.trim());
    const count = parseInt(countText, 10);
    sendCheat('addCard', { commonId, count });
}

function actionPoints(text) {
    const actionPointsCount = parseInt(text, 10);
    sendCheat('actionPoints', { actionPointsCount });
}

function sendCheat(type, data) {
    let ownUser = localGameDataFacade.getOwnUser();
    let ongoingMatch = localGameDataFacade.getOngoingMatch();

    ajax.jsonPost('/cheat', {
        type,
        data,
        playerId: ownUser.id,
        matchId: ongoingMatch.id
    });
}