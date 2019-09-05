const FakeCardDataAssembler = require('../../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../../../client/utils/getCardImageUrl.js');
const StateAsserter = require('../../matchTestUtils/ClientStateAsserter.js');
const FakeMatchController = require('../../matchTestUtils/FakeMatchController.js');
const MatchMode = require('../../../shared/match/MatchMode.js');
const Commander = require('../../../shared/match/commander/Commander.js');
const { setupClientState, spawnBot, BotId, PlayerId } = require('./botTestHelpers.js');
const { unflippedStationCard } = require('../../matchTestUtils/factories.js');
const {
    assert,
    refute,
    timeout,
    fakeCLock,
    sinon
} = require('../../bocha-jest/bocha-jest.js');

let clientState;
let stateAsserter;
let matchController;

async function setupFromState(fakeServerState = {}) {
    clientState = await setupClientState(fakeServerState);
    matchController = FakeMatchController();

    spawnBot({
        matchController,
        clientState
    });

    stateAsserter = StateAsserter(() => clientState.toServerState());
}

beforeEach(() => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');
});

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    clientState = null;
    stateAsserter = null;
    matchController = null;
});

describe('Selecting starting player', () => {
    test('When is choosing starting player should select starting player', async () => {
        await setupFromState({
            mode: 'chooseStartingPlayer',
            currentPlayer: BotId
        });

        assert.calledWith(matchController.emit, 'selectPlayerToStart', { playerToStartId: BotId });
    });

    test('When opponent is choosing starting player should NOT select starting player', async () => {
        await setupFromState({
            mode: 'selectStartingPlayer',
            currentPlayer: PlayerId
        });

        refute.calledWith(matchController.emit, 'selectPlayerToStart');
    });
});

describe('Select starting station cards', () => {
    test('When is selecting starting station cards and has to select 2 more cards', async () => {
        await setupFromState({
            mode: MatchMode.selectStationCards,
            currentPlayer: BotId,
            playerOrder: [BotId, PlayerId],
            stationCards: [
                unflippedStationCard('S1A', 'action')
            ],
            cardsOnHand: [
                createCard({ id: 'C2A' })
            ]
        });

        assert.calledWith(matchController.emit, 'selectStartingStationCard', { cardId: 'C2A', location: 'action' });
    });

    test('When is selecting starting station card and has NO more station cards to select should select a commander', async () => {
        await setupFromState({
            mode: MatchMode.selectStationCards,
            currentPlayer: BotId,
            playerOrder: [BotId, PlayerId],
            readyPlayerIds: [],
            commanders: [],
            stationCards: [
                unflippedStationCard('S1A', 'action'),
                unflippedStationCard('S2A', 'action'),
                unflippedStationCard('S3A', 'action')
            ],
            cardsOnHand: [
                createCard({ id: 'C2A' })
            ]
        });

        assert.calledWith(matchController.emit, 'selectCommander', { commander: Commander.FrankJohnson });
    });

    test('When has selected commander and is not ready should emit player ready', async () => {
        await setupFromState({
            mode: MatchMode.selectStationCards,
            currentPlayer: BotId,
            playerOrder: [BotId, PlayerId],
            readyPlayerIds: [],
            commanders: [Commander.FrankJohnson],
            stationCards: [
                unflippedStationCard('S1A', 'action'),
                unflippedStationCard('S2A', 'action'),
                unflippedStationCard('S3A', 'action')
            ],
            cardsOnHand: [
                createCard({ id: 'C2A' })
            ]
        });

        assert.calledWith(matchController.emit, 'playerReady');
    });

    test('when is selecting starting station cards and is already ready should NOT emit player ready', async () => {
        await setupFromState({
            mode: MatchMode.selectStationCards,
            currentPlayer: BotId,
            playerOrder: [BotId, PlayerId],
            readyPlayerIds: [BotId],
            stationCards: [
                unflippedStationCard('S1A', 'action'),
                unflippedStationCard('S2A', 'action'),
                unflippedStationCard('S3A', 'action')
            ],
            cardsOnHand: [
                createCard({ id: 'C2A' })
            ]
        });

        refute.calledWith(matchController.emit, 'playerReady');
    });

    test('When match mode is game', async () => {
        await setupFromState({
            mode: MatchMode.game
        });

        refute.calledWith(matchController.emit, 'selectStartingStationCard');
    });
});