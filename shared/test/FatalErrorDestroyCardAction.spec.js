const FakeCardDataAssembler = require('./testUtils/FakeCardDataAssembler.js');
const FatalErrorDestroyCardAction = require('../card/fatalError/FatalErrorDestroyCardAction.js');

test('Cannot select unflipped station cards for action when put down in home zone', () => {
    const fatalErrorAction = createAction();

    const canSelect = fatalErrorAction.validTarget(opponentUnflippedStationCard());

    expect(canSelect).toBe(false);
});

test('Can select flipped station cards for action when put down in home zone', () => {
    const fatalErrorAction = createAction();

    const canSelect = fatalErrorAction.validTarget(opponentflippedStationCard());

    expect(canSelect).toBe(true);
});

test('Can select non-station cards', () => {
    const fatalErrorAction = createAction();

    const canSelect = fatalErrorAction.validTarget(opponentNonStationCard());

    expect(canSelect).toBe(true);
});

test('Cannot select own cards', () => {
    const playerId = 'P1A';
    const fatalErrorAction = createAction({playerId});
    const target = ownNonStationCard();

    const canSelect = fatalErrorAction.validTarget(target);

    expect(target.isOpponentCard).toBeCalledWith(playerId);
    expect(canSelect).toBe(false);
});

test('Cannot select own station cards', () => {
    const playerId = 'P1A';
    const fatalErrorAction = createAction({playerId});
    const target = ownFlippedStationCard();

    const canSelect = fatalErrorAction.validTarget(target);

    expect(target.isOpponentCard).toBeCalledWith(playerId);
    expect(canSelect).toBe(false);
});

test('When target card costs NOT the same as Fatal Error can NOT select it', () => {
    const playerId = 'P1A';
    const fatalErrorAction = createAction({playerId, fatalErrorCost: 1});
    const target = opponentflippedStationCard({cost: 2});

    const canSelect = fatalErrorAction.validTarget(target);

    expect(canSelect).toBe(false);
});

test('When target card costs exactly the same as Fatal Error can select it', () => {
    const playerId = 'P1A';
    const fatalErrorAction = createAction({playerId, fatalErrorCost: 1});
    const target = opponentflippedStationCard({cost: 1});

    const canSelect = fatalErrorAction.validTarget(target);

    expect(canSelect).toBe(true);
});

function createAction(options = {}) {
    return new FatalErrorDestroyCardAction({
        playerId: options.playerId || '',
        fatalErrorCost: 0,
        ...options
    });
}

function opponentflippedStationCard(options = {}) {
    return Target({isOpponentCard: () => true, isStationCard: () => true, flipped: true, ...options});
}

function opponentUnflippedStationCard() {
    return Target({isOpponentCard: () => true, isStationCard: () => true, flipped: false});
}

function opponentNonStationCard() {
    return Target({isOpponentCard: () => true, isStationCard: () => false});
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
