let bocha = require('bocha');
let sinon = bocha.sinon;
let testCase = bocha.testCase;
let assert = bocha.assert;
let refute = bocha.refute;
let FakeCardDataAssembler = require('../testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
let CardInfoRepository = require('../../../shared/CardInfoRepository.js');
let ActionPointCalculator = require('../../../shared/match/ActionPointsCalculator.js');
let DiscardCardEvent = require('../../../shared/event/DiscardCardEvent.js');
let MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');
let AttackEvent = require('../../../shared/event/AttackEvent.js');
let PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');

module.exports = testCase('ActionPointCalculator', {
    'when put card in zone and then put down a station card in action row'() {
        const calculator = ActionPointCalculator({
            cardInfoRepository: FakeCardInfoRepository([
                { commonId: 'C1A', cost: 1 },
                { commonId: 'C2A', cost: 1 }
            ])
        });

        const actionPoints = calculator.calculate({
            events: [
                { type: 'putDownCard', cardCommonId: 'C1A', turn: 1, location: 'zone' },
                { type: 'putDownCard', cardCommonId: 'C2A', turn: 1, location: 'station-action' }
            ],
            turn: 1,
            phase: 'action',
            actionStationCardsCount: 4
        });

        assert.equals(actionPoints, 5);
    },
    'when has put down card in zone and action station card and is in discard phase'() {
        const calculator = ActionPointCalculator({
            cardInfoRepository: FakeCardInfoRepository([
                { commonId: 'C1A', cost: 1 },
                { commonId: 'C2A', cost: 1 }
            ])
        });

        const actionPoints = calculator.calculate({
            events: [
                { type: 'putDownCard', cardCommonId: 'C1A', turn: 1, location: 'zone' },
                { type: 'putDownCard', cardCommonId: 'C2A', turn: 1, location: 'station-action' }
            ],
            turn: 1,
            phase: 'discard',
            actionStationCardsCount: 4
        });

        assert.equals(actionPoints, 8);
    },
    'when has discarded 3 cards in the action phase and put down a card in own zone and put down a station card and it is the opponents turn'() {
        const calculator = ActionPointCalculator({
            cardInfoRepository: FakeCardInfoRepository([{ commonId: 'C1A', cost: 1 }])
        });

        const actionPoints = calculator.calculate({
            events: [
                DiscardCardEvent({ turn: 1, cardCommonId: 'C1A', phase: 'action' }),
                DiscardCardEvent({ turn: 1, cardCommonId: 'C1A', phase: 'action' }),
                DiscardCardEvent({ turn: 1, cardCommonId: 'C1A', phase: 'action' }),
                PutDownCardEvent({ turn: 1, location: 'zone', cardCommonId: 'C1A' }),
                PutDownCardEvent({ turn: 1, location: 'station-action', cardCommonId: 'C1A' })
            ],
            turn: 1,
            phase: 'wait',
            actionStationCardsCount: 3
        });

        assert.equals(actionPoints, 6);
    },
    'when has put down 1 zero cost card in zone and put down station card in action row'() {
        const calculator = ActionPointCalculator({
            cardInfoRepository: FakeCardInfoRepository([{ commonId: 'C1A', cost: 0 }])
        });

        const actionPoints = calculator.calculate({
            events: [
                PutDownCardEvent({ turn: 1, location: 'zone', cardCommonId: 'C1A' }),
                PutDownCardEvent({ turn: 1, location: 'station-action', cardCommonId: 'C1A' })
            ],
            turn: 1,
            phase: 'action',
            actionStationCardsCount: 4
        });

        assert.equals(actionPoints, 8);
    },
    'when discarded a card and put down a card in own zone and in the discard phase'() {
        const calculator = ActionPointCalculator({
            cardInfoRepository: FakeCardInfoRepository([{ commonId: 'C1A', cost: 1 }])
        });

        const actionPoints = calculator.calculate({
            events: [
                DiscardCardEvent({ turn: 1, phase: 'action', cardCommonId: 'C1A' }),
                PutDownCardEvent({ turn: 1, location: 'zone', cardCommonId: 'C1A' })
            ],
            turn: 1,
            phase: 'discard',
            actionStationCardsCount: 3
        });

        assert.equals(actionPoints, 6);
    },
    'when put down a station card in action row and then put down card in zone'() {
        const calculator = ActionPointCalculator({
            cardInfoRepository: FakeCardInfoRepository([{ commonId: 'C1A', cost: 1 }])
        });

        const actionPoints = calculator.calculate({
            events: [
                PutDownCardEvent({ turn: 1, location: 'station-action', cardCommonId: 'C1A' }),
                PutDownCardEvent({ turn: 1, location: 'zone', cardCommonId: 'C1A' })
            ],
            turn: 1,
            phase: 'action',
            actionStationCardsCount: 4
        });

        assert.equals(actionPoints, 7);
    },
    'when has duration card in zone since previous turn should include card cost'() {
        const calculator = ActionPointCalculator({
            cardInfoRepository: FakeCardInfoRepository([{ commonId: 'C1A', type: 'duration', cost: 1 }])
        });

        const actionPoints = calculator.calculate({
            events: [PutDownCardEvent({ turn: 1, location: 'zone', cardCommonId: 'C1A' })],
            turn: 2,
            phase: 'action',
            actionStationCardsCount: 1
        });

        assert.equals(actionPoints, 1);
    },
    'when has duration card in station since previous turn should NOT include card cost'() {
        const calculator = ActionPointCalculator({
            cardInfoRepository: FakeCardInfoRepository([{ commonId: 'C1A', type: 'duration', cost: 1 }])
        });

        const actionPoints = calculator.calculate({
            events: [PutDownCardEvent({ turn: 1, location: 'station-draw', cardCommonId: 'C1A' })],
            turn: 2,
            phase: 'action',
            actionStationCardsCount: 1
        });

        assert.equals(actionPoints, 2);
    },
    'when have discarded a duration card in previous turn should NOT include card cost'() {
        const calculator = ActionPointCalculator({
            cardInfoRepository: FakeCardInfoRepository([{ commonId: 'C1A', type: 'duration', cost: 1 }])
        });

        const actionPoints = calculator.calculate({
            events: [
                PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A:1', cardCommonId: 'C1A' }),
                DiscardCardEvent({ turn: 2, cardId: 'C1A:1', cardCommonId: 'C1A' })
            ],
            turn: 3,
            phase: 'action',
            actionStationCardsCount: 1
        });

        assert.equals(actionPoints, 2);
    }
});

function FakeCardInfoRepository(cards) {
    let cardDataAssembler = {
        createAll: () => cards.map(c => createCard(c))
    };
    return CardInfoRepository({ cardDataAssembler });
}