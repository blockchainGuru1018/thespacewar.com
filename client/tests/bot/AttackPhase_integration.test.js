/**
 * @jest-environment node
 */
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');
const SmallRepairShop = require("../../../shared/card/SmallRepairShop.js");
const { PHASES } = require('../../../shared/phases.js');
const { setupFromState, BotId, PlayerId } = require('./botTestHelpers.js');

describe('when has spaceShip (with attack strength) that has been in play for 1 turn', () => {
    let matchController;

    beforeEach(async () => {
        const stubs = await setupFromState({
            turn: 2,
            phase: 'attack',
            cardsInZone: [{ id: 'C1A', type: 'spaceShip', attack: 1 }],
            events: [PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' })]
        });
        matchController = stubs.matchController;
    });

    it('should move', () => {
        expect(matchController.emit).toBeCalledWith('moveCard', 'C1A');
    });

    it('should NOT go to the next phase move', () => {
        expect(matchController.emit).not.toBeCalledWith('nextPhase', expect.any(Object));
    });
});

it('when has spaceShip (with an attack strength) that has been in play for 1 turn should move it', async () => {
    const { matchController } = await setupFromState({
        turn: 2,
        phase: 'attack',
        cardsInZone: [{ id: 'C1A', type: 'spaceShip', attack: 1 }],
        events: [PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' })]
    });

    expect(matchController.emit).toBeCalledWith('moveCard', 'C1A');
});

describe('when has spaceShip in enemy zone that has been there for 1 turn', () => {
    let matchController;

    beforeEach(async () => {
        const stubs = await setupFromState({
            turn: 3,
            phase: 'attack',
            cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', attack: 1 }],
            opponentStationCards: [
                unflippedStationCard('S1A')
            ],
            events: [
                PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' }),
                MoveCardEvent({ cardId: 'C1A', turn: 2 })
            ]
        });
        matchController = stubs.matchController;
    });

    it('should attack enemy station', () => {
        expect(matchController.emit).toBeCalledWith('attackStationCard', {
            attackerCardId: 'C1A',
            targetStationCardIds: ['S1A']
        });
    });

    it('should NOT go to next phase', () => {
        expect(matchController.emit).not.toBeCalledWith('nextPhase', expect.any(Object));
    });

    it('should NOT move card', () => {
        expect(matchController.emit).not.toBeCalledWith('moveCard', 'C1A');
    });
});

it('should proceed to next phase', async () => {
    const { matchController } = await setupFromState({ turn: 1, phase: 'attack' });
    expect(matchController.emit).toBeCalledWith('nextPhase', { currentPhase: PHASES.attack });
});

describe('attacking in home zone', () => {
    it('when card can attack in home zone should attack', async () => {
        const { matchController } = await setupFromState({
            turn: 1,
            phase: 'attack',
            cardsInZone: [{ id: 'C1A', type: 'spaceShip', attack: 1 }],
            opponentCardsInPlayerZone: [
                { id: 'C2A', type: 'spaceShip', defense: 1 }
            ],
            events: [
                PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' }),
            ]
        });

        expect(matchController.emit).toBeCalledWith('attack', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
    });

    it('when card can attack in home zone and move, should NOT move', async () => {
        const { matchController } = await setupFromState({
            turn: 2,
            phase: 'attack',
            cardsInZone: [{ id: 'C1A', type: 'spaceShip', attack: 1 }],
            opponentCardsInPlayerZone: [
                { id: 'C2A', type: 'spaceShip', defense: 1 }
            ],
            events: [
                PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' }),
            ]
        });

        expect(matchController.emit).not.toBeCalledWith('move', 'C1A');
    });

    it('when card can attack in home zone, should NOT proceed to next phase', async () => {
        const { matchController } = await setupFromState({
            turn: 2,
            phase: 'attack',
            cardsInZone: [{ id: 'C1A', type: 'spaceShip', attack: 1 }],
            opponentCardsInPlayerZone: [
                { id: 'C2A', type: 'spaceShip', defense: 1 }
            ],
            events: [
                PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' }),
            ]
        });

        expect(matchController.emit).not.toBeCalledWith('nextPhase', expect.any(Object));
    });
});

test('when card in opponent zone, cannot attack station and has 1 available target should attack it', async () => {
    const { matchController } = await setupFromState({
        phase: 'attack',
        cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', attack: 1 }],
        opponentCardsInZone: [
            { id: 'C2A', type: 'spaceShip', defense: 1 }
        ],
        events: [
            PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' })
        ]
    });

    expect(matchController.emit).toBeCalledWith('attack', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
});

test('when repair ship in home zone and damaged card in home zone zone should repair it', async () => {
    const { matchController } = await setupFromState({
        phase: 'attack',
        cardsInZone: [
            { id: 'C1A', type: 'spaceShip', commonId: SmallRepairShop.CommonId },
            { id: 'C2A', type: 'spaceShip', damage: 1 }
        ],
        events: [
            PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' }),
            PutDownCardEvent({ cardId: 'C2A', turn: 1, location: 'zone' })
        ]
    });

    expect(matchController.emit).toBeCalledWith('repairCard', { repairerCardId: 'C1A', cardToRepairId: 'C2A' });
});

test('when has repair ship is in opponent zone and has damaged card both in home zone and in opponent zone, should repair card in opponent zone', async () => {
    const { matchController } = await setupFromState({
        phase: 'attack',
        cardsInZone: [
            { id: 'C1A', type: 'spaceShip', damage: 1 },
        ],
        cardsInOpponentZone: [
            { id: 'C2A', type: 'spaceShip', commonId: SmallRepairShop.CommonId },
            { id: 'C3A', type: 'spaceShip', damage: 1 }
        ],
        events: [
            PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' }),
            PutDownCardEvent({ cardId: 'C2A', turn: 1, location: 'zone' })
        ]
    });

    expect(matchController.emit).toBeCalledWith('repairCard', { repairerCardId: 'C2A', cardToRepairId: 'C3A' });
});

function unflippedStationCard(id, place = 'draw') {
    return {
        id,
        place,
        card: { id }
    }
}
