const LookAtStationRow = require('../match/card/actions/LookAtStationRow.js');

describe('can only look at handSize station row cards in action phase and has a card with that ability', () => {
    test('there is card with capability and is action phase', () => {
        const card = {};
        const action = LookAtStationRow({
            playerPhase: {
                isAction: () => true
            },
            cardsThatCanLookAtHandSizeStationRow: () => [card]
        });
        expect(action.canDoIt()).toBe(true);
    });
    test('has card with ability, but is NOT action phase', () => {
        const card = {};
        const action = LookAtStationRow({
            playerPhase: {
                isAction: () => false
            },
            cardsThatCanLookAtHandSizeStationRow: () => [card]
        });
        expect(action.canDoIt()).toBe(false);
    });
    test('is action phase, but does NOT have card with ability', () => {
        const action = LookAtStationRow({
            playerPhase: {
                isAction: () => true
            },
            cardsThatCanLookAtHandSizeStationRow: () => []
        });
        expect(action.canDoIt()).toBe(false);
    });
});

describe('add requirement when look at handSize station row', () => {
    test('card has requirement and stationRow is handSize', () => {
        const spec = 'SPEC';
        const card = { info: { requirementSpecsWhenLookAtHandSizeStationRow: spec } };
        const addRequirementFromSpec = { forCardAndSpec: jest.fn() };
        const action = createAction({ addRequirementFromSpec });

        action.doIt(card, 'handSize');

        expect(addRequirementFromSpec.forCardAndSpec).toBeCalledWith(card, spec)
    });
    test('stationRow is NOT hand size, do NOT do anything', () => {
        const spec = 'SPEC';
        const card = { info: { requirementSpecsWhenLookAtHandSizeStationRow: spec } };
        const addRequirementFromSpec = { forCardAndSpec: jest.fn() };
        const action = createAction({ addRequirementFromSpec });

        action.doIt(card, 'action');

        expect(addRequirementFromSpec.forCardAndSpec).not.toBeCalled()
    });
    test('when can NOT add requirement', () => {
        const spec = 'SPEC';
        const card = { info: { requirementSpecsWhenLookAtHandSizeStationRow: spec } };
        const addRequirementFromSpec = { forCardAndSpec: jest.fn() };
        const canAddRequirementFromSpec = { forCardWithSpecAndTarget: () => false };
        const action = createAction({
            addRequirementFromSpec,
            canAddRequirementFromSpec
        });

        action.doIt(card, 'handSize');

        expect(addRequirementFromSpec.forCardAndSpec).not.toBeCalled();
    });
});

function createAction(options = {}) {
    return LookAtStationRow({
        canAddRequirementFromSpec: {
            forCardWithSpecAndTarget: () => true
        },
        ...options
    });
}
