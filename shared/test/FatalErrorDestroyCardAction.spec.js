const FakeCardDataAssembler = require('./testUtils/FakeCardDataAssembler.js');
const FatalErrorDestroyCardAction = require('../card/fatalError/FatalErrorDestroyCardAction.js');

test('Can NOT select unflipped station cards for action when put down in home zone', () => {
    const fatalErrorAction = createAction();

    const canSelect = fatalErrorAction.validTarget(opponentUnflippedStationCard());

    expect(canSelect).toBe(false);
});

test('Can NOT select flipped station cards for action when put down in home zone', () => {
    const fatalErrorAction = createAction();

    const canSelect = fatalErrorAction.validTarget(opponentflippedStationCard());

    expect(canSelect).toBe(false);
});

test('Can select non-station cards', () => {
    const fatalErrorAction = createAction();

    const canSelect = fatalErrorAction.validTarget(opponentNonStationCard());

    expect(canSelect).toBe(true);
});

test('Can NOT select own cards', () => {
    const playerId = 'P1A';
    const fatalErrorAction = createAction({playerId});
    const target = ownNonStationCard();

    const canSelect = fatalErrorAction.validTarget(target);

    expect(target.isOpponentCard).toBeCalledWith(playerId);
    expect(canSelect).toBe(false);
});

test('Can NOT select own station cards', () => {
    const playerId = 'P1A';
    const fatalErrorAction = createAction({playerId});
    const target = ownFlippedStationCard();

    const canSelect = fatalErrorAction.validTarget(target);

    expect(target.isOpponentCard).toBeCalledWith(playerId);
    expect(canSelect).toBe(false);
});

test('Can NOT target card that costs 2 when has 1 action point', () => {
    const playerId = 'P1A';
    const fatalErrorAction = createAction({
        playerId,
        toggleCostPenaltyAbility: true,
        toggleEqualCostAbility: false
    });
    const target = opponentNonStationCard({cost: 2});
    const actionPoints = 1;

    const canSelect = fatalErrorAction.validTarget(target, actionPoints);

    expect(canSelect).toBe(false);
});

test('Can target card that costs 2 when has 2 action points', () => {
    const playerId = 'P1A';
    const fatalErrorAction = createAction({playerId, toggleCostPenaltyAbility: true, toggleEqualCostAbility: false});
    const target = opponentNonStationCard({cost: 2});
    const actionPoints = 2;

    const canSelect = fatalErrorAction.validTarget(target, actionPoints);

    expect(canSelect).toBe(true);
});

test('Can target card that costs 1 when has 2 action points', () => {
    const playerId = 'P1A';
    const fatalErrorAction = createAction({playerId, toggleCostPenaltyAbility: true, toggleEqualCostAbility: false});
    const target = opponentNonStationCard({cost: 1});
    const actionPoints = 2;

    const canSelect = fatalErrorAction.validTarget(target, actionPoints);

    expect(canSelect).toBe(true);
});

function createAction(options = {}) {
    return new FatalErrorDestroyCardAction({
        playerId: options.playerId || '',
        ...options
    });
}

function opponentflippedStationCard(options = {}) {
    return Target({isOpponentCard: () => true, isStationCard: () => true, flipped: true, ...options});
}

function opponentUnflippedStationCard() {
    return Target({isOpponentCard: () => true, isStationCard: () => true, flipped: false});
}

function opponentNonStationCard(options = {}) {
    return Target({isOpponentCard: () => true, isStationCard: () => false, ...options});
}

function ownNonStationCard() {
    return Target({isOpponentCard: jest.fn().mockReturnValue(false), isStationCard: () => false});
}

function ownFlippedStationCard() {
    return Target({isOpponentCard: jest.fn().mockReturnValue(false), isStationCard: () => true, flipped: true});
}

function Target(options = {}) {
    return FakeCardDataAssembler.createCard(options);
}
