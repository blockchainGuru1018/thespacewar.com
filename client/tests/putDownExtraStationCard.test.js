const FakeCardDataAssembler = require('../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../utils/getCardImageUrl.js');
const FakeState = require('../testUtils/FakeState.js');
const FakeMatchController = require('../testUtils/FakeMatchController.js');
const ExcellentWork = require('../../shared/card/ExcellentWork.js');
const Expansion = require('../../shared/card/Expansion.js');
const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');
const CardInfoRepository = require('../../shared/CardInfoRepository.js');
const { createController } = require('../testUtils');
const {
    assert,
    refute,
    timeout,
    stub,
    dom: {
        click
    }
} = require('../testUtils/bocha-jest/bocha-jest.js');

let controller;
let matchController;

// TODO *-marked tests fail because of an issue with Vue transitions in Jest and the js-dom. The transition leaves duplicates of transitioned elements. Thus v-if is not working properly with hiding the card ghosts.

function setUpController(optionsAndPageDeps = {}) { //Has side effects to afford a convenient tear down
    matchController = FakeMatchController();
    controller = createController({ matchController, ...optionsAndPageDeps });

    return controller;
}

beforeEach(() => {
    getCardImageUrl.byCommonId = commonId => `/${commonId}`
});

afterEach(() => {
    controller && controller.tearDown();
    matchController = null;
    controller = null;
});

describe('when has already put down station card this turn and holding Excellent work', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { id: 'C0A', place: 'action' },
                { id: 'C1A', place: 'action' }
            ],
            cardsOnHand: [{ id: 'C2A', cost: 1, type: 'event', commonId: ExcellentWork.CommonId }],
            events: [
                PutDownCardEvent({
                    turn: 1,
                    location: 'station-action',
                    cardId: 'C1A'
                })
            ]
        }));
        await timeout();

        await click('.playerCardsOnHand .cardOnHand');
    });

    test('should NOT show station ghosts', () => {
        assert.elementCount('.playerStationCards .card-ghost', 0);
    });

    test('should see zone ghosts', () => {
        assert.elementCount('.playerEventCardGhost', 1);
    });
});

describe('when has already put down station card this turn and holding Excellent work and cannot afford card', () => {
        beforeEach(async () => {
            const { dispatch, showPage } = setUpController();
            showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                stationCards: [
                    { id: 'C1A', place: 'action' }
                ],
                cardsOnHand: [{ id: 'C2A', cost: 1, type: 'event', commonId: ExcellentWork.CommonId }],
                events: [
                    PutDownCardEvent({
                        turn: 1,
                        location: 'station-action',
                        cardId: 'C1A'
                    })
                ]
            }));
            await timeout();

            await click('.playerCardsOnHand .cardOnHand');
        });

        test('should NOT show station ghosts', () => {
            assert.elementCount('.playerStationCards .card-ghost', 0);
        });

        test('should see "cannot play card" event ghost', () => {
            assert.elementCount('.playerEventCardGhost--deactivated', 1);
        });
    });

describe('when has NOT put down station card this turn and holding Excellent work and cannot afford card', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { id: 'C1A', place: 'draw' }
            ],
            cardsOnHand: [{ id: 'C2A', cost: 1, type: 'event', commonId: ExcellentWork.CommonId }],
        }));
        await timeout();

        await click('.playerCardsOnHand .cardOnHand');
    });

    test('should show station ghosts', () => {
        assert.elementCount('.playerStationCards .card-ghost', 3);
    });

    test('should see "cannot play card" event ghost', () => {
        assert.elementCount('.playerEventCardGhost--deactivated', 1);
    });
});

// TODO * see top comment
// describe('putting down card and selecting choice "Put down as extra station card"', async () => {
//     beforeEach(async () => {
//         const { dispatch, showPage } = setUpController();
//         showPage();
//         dispatch('stateChanged', FakeState({
//             turn: 1,
//             currentPlayer: 'P1A',
//             phase: 'action',
//             cardsOnHand: [{ id: 'C1A', type: 'event', commonId: ExcellentWork.CommonId }]
//         }));
//         await timeout();
//         await click('.playerCardsOnHand .cardOnHand');
//         await click('.playerEventCardGhost');
//
//         await click('.cardChoiceDialog-choice:contains("Put down as extra station card")');
//     });
//
//     test('should ONLY show station ghosts', async () => {
//         const stationGhosts = document.querySelectorAll('.playerStationCards .card-ghost');
//         const allGhosts = document.querySelectorAll('.card-ghost');
//         assert.equals(allGhosts.length - stationGhosts.length, 0);
//     });
// });

describe('have put down Excellent work and selected "Put down as extra station card" and put down in first station row', () => {
        beforeEach(async () => {
            const { dispatch, showPage } = setUpController({
                cardInfoRepository: FakeCardInfoRepository([
                    { commonId: ExcellentWork.CommonId, cost: 2 }
                ])
            });
            showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [{ id: 'C1A', type: 'event', commonId: ExcellentWork.CommonId }],
                stationCards: [{ id: 'C2A', place: 'action' }]
            }));
            await timeout();
            await click('.playerCardsOnHand .cardOnHand');
            await click('.playerEventCardGhost');
            await click('.cardChoiceDialog-choice:contains("Put down as extra station card")');
            await click('.playerStationCards .card-ghost:eq(0)');
        });

        test('should emit putDownCard', () => {
            assert.calledWith(matchController.emit, 'putDownCard', {
                location: 'station-draw',
                cardId: 'C1A',
                choice: 'putDownAsExtraStationCard'
            });
        });

        test('should have reduced action points by the cost of Excellent Work', () => {
            assert.elementText('.playerActionPoints', '0 action points remaining');
        });
    });

describe('when has excellent work as flipped station card and move it to zone', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { id: 'C1A', place: 'draw', },
                {
                    id: 'C2A',
                    place: 'draw',
                    flipped: true,
                    card: createCard({ id: 'C2A', type: 'event', commonId: ExcellentWork.CommonId })
                },
            ]
        }));
        await timeout();
        await click('.playerStationCards .moveToZone');
    });

    test('should show choice dialog', async () => {
        assert.elementCount('.cardChoiceDialog', 1);
    });
});

// TODO * see top comment
// describe('have put down "Expansion" and is holding another card', async () => {
//     beforeEach(async () => {
//         const { dispatch, showPage } = setUpController();
//         showPage();
//         dispatch('stateChanged', FakeState({
//             turn: 1,
//             currentPlayer: 'P1A',
//             phase: 'action',
//             cardsOnHand: [
//                 { id: 'C1A', type: 'event', commonId: Expansion.CommonId },
//                 { id: 'C2A' },
//                 { id: 'C3A' }
//             ]
//         }));
//         await timeout();
//         await click('.playerCardsOnHand .cardOnHand:eq(0)');
//         await click('.playerEventCardGhost');
//         await click('.playerCardsOnHand .cardOnHand:eq(0)');
//         await click('.playerStationCards .card-ghost:eq(0)');
//
//         await click('.playerCardsOnHand .cardOnHand');
//     });
//
//     test('should show station card ghosts', async () => {
//         assert.elementCount('.playerStationCards .card-ghost', 3);
//     });
// });

// TODO * see top comment
// describe('have put down "Expansion" and put down 3 station cards and is holding another card', async () => {
//     beforeEach(async () => {
//         const { dispatch, showPage } = setUpController();
//         showPage();
//         dispatch('stateChanged', FakeState({
//             turn: 1,
//             currentPlayer: 'P1A',
//             phase: 'action',
//             cardsOnHand: [
//                 { id: 'C1A', type: 'event', commonId: Expansion.CommonId },
//                 { id: 'C2A' },
//                 { id: 'C3A' },
//                 { id: 'C4A' },
//                 { id: 'C5A' }
//             ]
//         }));
//         await timeout();
//         await click('.playerCardsOnHand .cardOnHand:eq(0)');
//         await click('.playerEventCardGhost');
//         await click('.playerCardsOnHand .cardOnHand:eq(0)');
//         await click('.playerStationCards .card-ghost:eq(0)');
//         await click('.playerCardsOnHand .cardOnHand:eq(0)');
//         await click('.playerStationCards .card-ghost:eq(0)');
//         await click('.playerCardsOnHand .cardOnHand:eq(0)');
//         await click('.playerStationCards .card-ghost:eq(0)');
//
//         await click('.playerCardsOnHand .cardOnHand');
//     });
//
//     test('should NOT show station card ghost ', async () => {
//         assert.elementCount('.playerStationCards .card-ghost', 0);
//     });
// });

function FakeCardInfoRepository(cards) {
    let cardDataAssembler = {
        createAll: () => cards.map(c => createCard(c))
    };
    return CardInfoRepository({ cardDataAssembler });
}
