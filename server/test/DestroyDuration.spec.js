const FakeCardDataAssembler = require('../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const DestroyDuration = require('../../shared/card/DestroyDuration.js');
const setupIntegrationTest = require('./testUtils/setupIntegrationTest.js');

const DestroyDurationCommonId = DestroyDuration.CommonId;

const SameCostAsFatalError = 0; //Can be whatever, just has to be consistent in test

describe('Destroy Duration Card', () => {

    it('Should be able to sacrificed after first turn and if have not attack yet', () => {
        expect(true).toBeTruthy();

        const {match} = setupIntegrationTest({
            turn: 4,
            playerStateById: {
                'P1A': {
                    phase: 'attack',
                    cardsOnHand: [createCard({
                        id: 'C1A',
                        commonId: DestroyDurationCommonId,
                        cost: SameCostAsFatalError
                    })],
                    stationCards: [
                        stationCard({id: 'C2A', flipped: false, card: {cost: SameCostAsFatalError}}),
                        stationCard({id: 'C3A', flipped: true}),
                    ],
                    events: [
                        {
                            type: "putDownCard",
                            created: 1593355946044,
                            turn: 1,
                            location: "zone",
                            cardId: "21",
                            cardCommonId: DestroyDurationCommonId,
                            putDownAsExtraStationCard: false,
                            grantedForFreeByEvent: false,
                            startingStation: false
                        }
                    ],
                    cardsInZone: [
                        {
                            id: "21",
                            commonId: DestroyDurationCommonId,
                            color: "red",
                            type: "space-ship",
                            name: "Destroy Duration",
                            description: "After first turn: Sacrifice instead of attacking to destroy a duration card.",
                            cost: 1,
                            attack: 1,
                            defense: 1,
                            paralyzed: false
                        }
                    ]
                    // : [createCard({id: 'C1A', commonId: DestroyDurationCommonId, cost: SameCostAsFatalError})],
                },
                'P2A': {
                    stationCards: [
                        stationCard({id: 'C2A', flipped: false, card: {cost: SameCostAsFatalError}}),
                        stationCard({id: 'C3A', flipped: true}),
                    ],
                    cardsInZone: [
                        {
                            id: "C1A",
                            commonId: DestroyDurationCommonId,
                            color: "red",
                            type: "duration",
                            name: "duration test",
                            description: "duration test",
                            cost: 1,
                            attack: 1,
                            defense: 1,
                            paralyzed: false
                        }
                    ]
                }
            }
        });
        const error = catchError(() => match.sacrifice('P1A', {cardId: '21', targetCardId: 'C1A'}));
        expect(error).toBeUndefined();
        expect(match.getOwnState('P2A').discardedCards).toEqual([
            {
                id: "C1A",
                commonId: DestroyDurationCommonId,
                color: "red",
                type: "duration",
                name: "duration test",
                description: "duration test",
                cost: 1,
                attack: 1,
                defense: 1,
                paralyzed: false
            }
        ]);
        expect(match.getOwnState('P1A').discardedCards).toEqual([
            {
                id: "21",
                commonId: DestroyDurationCommonId,
                color: "red",
                type: "space-ship",
                name: "Destroy Duration",
                description: "After first turn: Sacrifice instead of attacking to destroy a duration card.",
                cost: 1,
                attack: 1,
                defense: 1,
                paralyzed: false
            }
        ]);
    });

    it('Should not be able to sacrifice on first turn', () => {
        expect(true).toBeTruthy();

        const {match} = setupIntegrationTest({
            turn: 1,
            playerStateById: {
                'P1A': {
                    phase: 'attack',
                    cardsOnHand: [createCard({
                        id: 'C1A',
                        commonId: DestroyDurationCommonId,
                        cost: SameCostAsFatalError
                    })],
                    stationCards: [
                        stationCard({id: 'C2A', flipped: false, card: {cost: SameCostAsFatalError}}),
                        stationCard({id: 'C3A', flipped: true}),
                    ],
                    events: [
                        {
                            type: "putDownCard",
                            created: 1593355946044,
                            turn: 1,
                            location: "zone",
                            cardId: "21",
                            cardCommonId: DestroyDurationCommonId,
                            putDownAsExtraStationCard: false,
                            grantedForFreeByEvent: false,
                            startingStation: false
                        }
                    ],
                    cardsInZone: [
                        {
                            id: "21",
                            commonId: DestroyDurationCommonId,
                            color: "red",
                            type: "space-ship",
                            name: "Destroy Duration",
                            description: "After first turn: Sacrifice instead of attacking to destroy a duration card.",
                            cost: 1,
                            attack: 1,
                            defense: 1,
                            paralyzed: false
                        }
                    ]
                },
                'P2A': {
                    stationCards: [
                        stationCard({id: 'C2A', flipped: false, card: {cost: SameCostAsFatalError}}),
                        stationCard({id: 'C3A', flipped: true}),
                    ],
                    cardsInZone: [
                        {
                            id: "C1A",
                            commonId: DestroyDurationCommonId,
                            color: "red",
                            type: "duration",
                            name: "Destroy Duration",
                            description: "After first turn: Sacrifice instead of attacking to destroy a duration card.",
                            cost: 1,
                            attack: 1,
                            defense: 1,
                            paralyzed: false
                        }
                    ]
                }
            }
        });
        const error = catchError(() => match.sacrifice('P1A', {cardId: '21', targetCardId: 'C1A'}));
        expect(error).toBeTruthy();
        expect(error.message).toBe('Cannot sacrifice');
    });
});

function catchError(callback) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}

function stationCard({place = 'draw', flipped, id, card = {}}) {
    return {
        place,
        flipped,
        card: {id, ...card}
    };
}
