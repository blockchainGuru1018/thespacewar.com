const getCardImageUrl = require('../utils/getCardImageUrl.js');
const FakeMatchController = require('../testUtils/FakeMatchController.js');
const { createController } = require('../testUtils');
const {
    sinon,
} = require('../testUtils/bocha-jest/bocha-jest.js');

let controller;

beforeEach(() => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');

    controller = createController();
});

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    controller && controller.tearDown();
});

export default function (emitStub = jest.fn()) {
    controller = createController({
        matchController: FakeMatchController({ emit: emitStub })
    });
    return controller;
}
