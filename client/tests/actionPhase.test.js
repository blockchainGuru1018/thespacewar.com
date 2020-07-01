const FakeCardDataAssembler = require('../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../utils/getCardImageUrl.js');
const FakeState = require('../testUtils/FakeState.js');
const {createController} = require('../testUtils');
const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');
const {
    assert,
    sinon,
    timeout,
    dom: {
        click
    }
} = require('../testUtils/bocha-jest/bocha-jest.js');

let controller;

beforeEach(() => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');

    controller = createController({
        cardInfoRepository: {
            getType() {
            },
            getCost() {
                return 2;
            },
            getImageUrl() {
            }
        }
    });
});

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    controller && controller.tearDown();
});

describe('action phase', () => {
    describe('when in action phase and click card on hand', () => {
        beforeEach(async () => {
            const {dispatch, showPage} = controller;
            showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [createCard({id: 'C1A'})],
                stationCards: [{place: 'draw'}]
            }));
            await timeout();

            await click('.playerCardsOnHand .cardOnHand');
        });

        test('should see station card ghosts', async () => {
            assert.elementCount('.field-playerStation .card-ghost', 3);
        });
    });

    it('should not see end turn modal confirmation when have action points is equal to 0', async () => {
        const {dispatch, showPage} = controller;
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 2,
            currentPlayer: 'P1A',
            phase: 'action',
            events: [PutDownCardEvent({turn: 2, location: 'zone'}),
                PutDownCardEvent({turn: 2, location: 'station-action'})],
            stationCards: [{place: 'action'}, {place: 'action'}],
            cardsOnHand: [createCard({id: 'C2A'}), createCard({id: 'C3A'})]
        }));

        await timeout();

        await click('.nextPhaseButton-onTheLeft');
        assert.elementCount('.confirmDialogHeader', 0);
    });
    it('should  see end turn modal confirmation when have action points > 1 and cards in hand > 1', async () => {
        const {dispatch, showPage} = controller;
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 2,
            currentPlayer: 'P1A',
            phase: 'action',
            events: [PutDownCardEvent({turn: 2, location: 'zone'}),
                PutDownCardEvent({turn: 2, location: 'station-action'})],
            stationCards: [{place: 'action'}, {place: 'action'}, {place: 'action'}],
            cardsOnHand: [createCard({id: 'C2A'}), createCard({id: 'C3A'})]
        }));

        await timeout();

        await click('.nextPhaseButton-onTheLeft');
        assert.elementCount('.confirmDialogHeader', 1);
        assert.elementText('.confirmDialogContent', `You have 2 actions remaining this turn. Are you sure you don't want to use them?`)
    });
    it('should  see end turn modal confirmation when have not putdown station cards', async () => {
        const {dispatch, showPage} = controller;
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 2,
            currentPlayer: 'P1A',
            phase: 'action',
            events: [PutDownCardEvent({turn: 2, location: 'zone'})],
            stationCards: [{place: 'action'}],
            cardsOnHand: [createCard({id: 'C2A'}), createCard({id: 'C3A'})]
        }));

        await timeout();

        await click('.nextPhaseButton-onTheLeft');
        assert.elementCount('.confirmDialogHeader', 1);
        assert.elementText('.confirmDialogContent', `Are you sure you don't want to put down a station card this turn?`);
    });
    it('should  not see end turn modal confirmation when have putdown station cards', async () => {
        const {dispatch, showPage} = controller;
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 2,
            currentPlayer: 'P1A',
            phase: 'action',
            events: [ PutDownCardEvent({turn: 2, location: 'station-action'})],
            stationCards: [{place: 'action'}],
            cardsOnHand: [createCard({id: 'C2A'}), createCard({id: 'C3A'})]
        }));

        await timeout();

        await click('.nextPhaseButton-onTheLeft');
        assert.elementCount('.confirmDialogHeader', 0);
    });
});
