/**
 * @jest-environment node
 */
const FakeCardDataAssembler = require('../../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const MatchMode = require('../../../shared/match/MatchMode.js');
const Commander = require('../../../shared/match/commander/Commander.js');
const { setupFromState, BotId, PlayerId } = require('./botTestHelpers.js');
const { unflippedStationCard } = require('../../testUtils/factories.js');

describe('In match mode for "select starting station cards"', () => {
    test('should put down first starting station card in the draw-row', async () => {
        const { matchController } = await setupFromState({
            mode: MatchMode.selectStationCards,
            currentPlayer: BotId,
            playerOrder: [BotId, PlayerId],
            stationCards: [],
            cardsOnHand: [
                createCard({ id: 'C2A' })
            ]
        });

        expect(matchController.emit).toBeCalledWith('selectStartingStationCard', { cardId: 'C2A', location: 'draw' });
    });

    test('should put down the second starting station card in the action-row', async () => {
        const { matchController } = await setupFromState({
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

        expect(matchController.emit).toBeCalledWith('selectStartingStationCard', { cardId: 'C2A', location: 'action' });
    });

    test('should put down the third starting station card in the handSize-row', async () => {
        const { matchController } = await setupFromState({
            mode: MatchMode.selectStationCards,
            currentPlayer: BotId,
            playerOrder: [BotId, PlayerId],
            stationCards: [
                unflippedStationCard('S1A', 'action'),
                unflippedStationCard('S2A', 'action')
            ],
            cardsOnHand: [
                createCard({ id: 'C2A' })
            ]
        });

        expect(matchController.emit).toBeCalledWith('selectStartingStationCard', {
            cardId: 'C2A',
            location: 'handSize'
        });
    });

    test('when can put down a fourth starting station card should put down card in the action-row', async () => {
        const { matchController } = await setupFromState({
            mode: MatchMode.selectStationCards,
            currentPlayer: PlayerId,
            playerOrder: [PlayerId, BotId],
            stationCards: [
                unflippedStationCard('S1A', 'draw'),
                unflippedStationCard('S2A', 'action'),
                unflippedStationCard('S3A', 'handSize')
            ],
            cardsOnHand: [
                createCard({ id: 'C2A' })
            ]
        });

        expect(matchController.emit).toBeCalledWith('selectStartingStationCard', { cardId: 'C2A', location: 'action' });
    });

    test('When has NO more station cards to select should select a commander', async () => {
        const { matchController } = await setupFromState({
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

        expect(matchController.emit).toBeCalledWith('selectCommander', { commander: Commander.FrankJohnson });
    });

    test('When has selected commander and is not ready should emit player ready', async () => {
        const { matchController } = await setupFromState({
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

        expect(matchController.emit).toBeCalledWith('playerReady');
    });

    test('when is already ready should NOT emit player ready', async () => {
        const { matchController } = await setupFromState({
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

        expect(matchController.emit).not.toBeCalledWith('playerReady');
    });

    test('When match mode is game', async () => {
        const { matchController } = await setupFromState({
            mode: MatchMode.game
        });

        expect(matchController.emit).not.toBeCalledWith('selectStartingStationCard');
    });
});
