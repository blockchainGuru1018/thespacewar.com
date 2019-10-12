const MatchMode = require('../../shared/match/MatchMode.js');
const Commander = require("../../shared/match/commander/Commander.js");
const ClientStateChanger = require('./ClientStateChanger.js');
const mapFromClientToServerState = require('../../client/match/mapFromClientToServerState.js');
const GameConfig = require('../../shared/match/GameConfig.js');

function ClientState({
    userRepository,
    opponentUser,
    matchId
}) {

    const state = {
        mode: MatchMode.firstMode,
        readyPlayerIds: [],
        lastStandInfo: null,
        gameConfigEntity: null,
        commanders: [],
        actionLogEntries: [],
        opponentActionLogEntries: [],
        turn: 1,
        currentPlayer: null,
        phase: '',
        events: [],
        requirements: [],
        matchId,
        opponentUser,
        ownUser: userRepository.getOwnUser(),
        playerOrder: [],
        playerCardsInZone: [],
        playerCardsOnHand: [],
        playerDiscardedCards: [],
        playerStation: {
            drawCards: [],
            actionCards: [],
            handSizeCards: []
        },
        playerCardsInOpponentZone: [],
        playerCardsInDeckCount: 0,
        opponentCommanders: [],
        opponentPhase: '',
        opponentCardCount: 0,
        opponentDiscardedCards: [],
        opponentStation: {
            drawCards: [],
            actionCards: [],
            handSizeCards: []
        },
        opponentCardsInPlayerZone: [],
        opponentCardsInZone: [],
        opponentCardsInDeckCount: 0,
        opponentEvents: [],
        opponentRequirements: [],
        attackerCardId: null,
        selectedDefendingStationCards: [],
        repairerCardId: null,
        ended: false,
        retreatedPlayerId: null,
        shake: false,
        highlightCardIds: [],
        flashAttackedCardId: null,
        flashDiscardPile: false,
        flashOpponentDiscardPile: false
    };

    let updateListener = () => {};

    return {
        update,
        onUpdate,
        read: () => state,
        toServerState,
        gameConfig
    };

    async function update(clientState) {
        const stateChanger = ClientStateChanger({ state });
        stateChanger.stateChanged(clientState);
        await updateListener();
    }

    function onUpdate(listener) {
        updateListener = listener;
    }

    function toServerState() {
        return mapFromClientToServerState(state);
    }

    function gameConfig() {
        if (!state.gameConfigEntity) {
            return GameConfig.notLoaded();
        }

        return GameConfig(state.gameConfigEntity);
    }
}

module.exports = ClientState;
