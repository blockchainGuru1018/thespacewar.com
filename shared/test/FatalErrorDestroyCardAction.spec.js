import FatalErrorDestroyCardAction from '../card/fatalError/FatalErrorDestroyCardAction.js';

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
    const fatalErrorAction = createAction({ playerId });
    const target = ownNonStationCard();

    const canSelect = fatalErrorAction.validTarget(target);

    expect(target.isOpponentCard).toBeCalledWith(playerId);
    expect(canSelect).toBe(false);
});

test('Cannot select own station cards', () => {
    const playerId = 'P1A';
    const fatalErrorAction = createAction({ playerId });
    const target = ownFlippedStationCard();

    const canSelect = fatalErrorAction.validTarget(target);

    expect(target.isOpponentCard).toBeCalledWith(playerId);
    expect(canSelect).toBe(false);
});

function createAction(options = {}) {
    return new FatalErrorDestroyCardAction({
        playerId: options.playerId || ''
    });
}

function opponentflippedStationCard() {
    return Target({ isOpponentCard: () => true, isStationCard: () => true, flipped: true });
}

function opponentUnflippedStationCard() {
    return Target({ isOpponentCard: () => true, isStationCard: () => true, flipped: false });
}

function opponentNonStationCard() {
    return Target({ isOpponentCard: () => true, isStationCard: () => false });
}

function ownNonStationCard() {
    return Target({ isOpponentCard: jest.fn().mockReturnValue(false), isStationCard: () => false });
}

function ownFlippedStationCard() {
    return Target({ isOpponentCard: jest.fn().mockReturnValue(false), isStationCard: () => true, flipped: true });
}

function Target(options = {}) {
    return Object.assign({
        flipped: false,
        isStationCard: () => false,
        isOpponentCard: () => false
    }, options);
}
