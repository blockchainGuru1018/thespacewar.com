/**
 * @jest-environment node
 */
const DecideRowForStationCard = require('../../ai/DecideRowForStationCard.js');

// D=draw row, A=action row, H=Hand size row

test('D=0 A=1 H=1, should decide on draw row', () => {
    const decide = DecideRowForStationCard({
        playerStateService: {
            getStationCards: () => [actionCard(), handSizeCard()]
        }
    });
    expect(decide()).toBe('draw');
});

test('D=1 A=0 H=1, should decide on action row', () => {
    const decide = DecideRowForStationCard({
        playerStateService: {
            getStationCards: () => [drawCard(), handSizeCard()]
        }
    });
    expect(decide()).toBe('action');
});

test('D=1 A=1 H=0, should decide on handSize row', () => {
    const decide = DecideRowForStationCard({
        playerStateService: {
            getStationCards: () => [drawCard(), actionCard()]
        }
    });
    expect(decide()).toBe('handSize');
});

test('D=1 A=2 H=2, should decide on action row', () => {
    const decide = DecideRowForStationCard({
        playerStateService: {
            getStationCards: () => [
                drawCard(),
                actionCard(), actionCard(),
                handSizeCard(), handSizeCard()
            ]
        }
    });
    expect(decide()).toBe('action');
});

test('D=1 A=3 H=2, should decide on action row', () => {
    const decide = DecideRowForStationCard({
        playerStateService: {
            getStationCards: () => [
                drawCard(),
                actionCard(), actionCard(), actionCard(),
                handSizeCard(), handSizeCard()
            ]
        }
    });
    expect(decide()).toBe('action');
});

test('D=2 A=4 H=1, should decide on handSize row', () => {
    const decide = DecideRowForStationCard({
        playerStateService: {
            getStationCards: () => [
                drawCard(), drawCard(),
                actionCard(), actionCard(), actionCard(), actionCard(),
                handSizeCard()
            ]
        }
    });
    expect(decide()).toBe('handSize');
});

test('D=1 A=4 H=1, should decide on draw row', () => {
    const decide = DecideRowForStationCard({
        playerStateService: {
            getStationCards: () => [
                drawCard(),
                actionCard(), actionCard(), actionCard(), actionCard(),
                handSizeCard()
            ]
        }
    });
    expect(decide()).toBe('draw');
});

function drawCard() {
    return { place: 'draw' };
}

function actionCard() {
    return { place: 'action' };
}

function handSizeCard() {
    return { place: 'handSize' };
}
