const {
    refute,
    assert,
    sinon,
    stub,
} = require("../testUtils/bocha-jest/bocha");
const TestHelper = require("../fakeFactories/TestHelper.js");
const createState = require("../fakeFactories/createState.js");

module.exports = {
    'spec with property "ifAddedAddAlso" and requirement is successfully added': {
        setUp() {
            const testHelper = TestHelper(createState({}));
            this.playerRequirementService = {
                addEmptyCommonWaitingRequirement: stub().returns({}),
            };
            this.opponentRequirementService = {
                addCardRequirement: stub().returns({}),
            };
            testHelper.stub(
                "playerRequirementService",
                "P1A",
                this.playerRequirementService
            );
            testHelper.stub(
                "playerRequirementService",
                "P2A",
                this.opponentRequirementService
            );
            this.addRequirementFromSpec = testHelper.addRequirementFromSpec(
                "P1A"
            );
            this.addRequirementFromSpec.forCardAndSpec(
                {},
                {
                    forOpponent: [
                        {
                            type: "drawCard",
                            count: 1,
                            common: true,
                            ifAddedAddAlso: [
                                {
                                    forOpponent: [],
                                    forPlayer: [
                                        {
                                            type: "drawCard",
                                            count: 0,
                                            common: true,
                                            waiting: true,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    forPlayer: [],
                }
            );
        },
        "should add requirement to opponent"() {
            assert.calledOnce(
                this.opponentRequirementService.addCardRequirement
            );
            assert.calledWith(
                this.opponentRequirementService.addCardRequirement,
                sinon.match({
                    type: "drawCard",
                    count: 1,
                    common: true,
                })
            );
        },
        "should add extra requirement to player"() {
            assert.calledOnce(
                this.playerRequirementService.addEmptyCommonWaitingRequirement
            );
            assert.calledWith(
                this.playerRequirementService.addEmptyCommonWaitingRequirement,
                sinon.match({ type: "drawCard" })
            );
        },
    },
    'spec with property "ifAddedAddAlso" but requirement is NOT added': {
        setUp() {
            const testHelper = TestHelper(createState({}));
            this.playerRequirementService = {
                addEmptyCommonWaitingRequirement: stub().returns(null),
            };
            this.opponentRequirementService = {
                addCardRequirement: stub().returns(null),
            };
            testHelper.stub(
                "playerRequirementService",
                "P1A",
                this.playerRequirementService
            );
            testHelper.stub(
                "playerRequirementService",
                "P2A",
                this.opponentRequirementService
            );
            this.addRequirementFromSpec = testHelper.addRequirementFromSpec(
                "P1A"
            );
            this.addRequirementFromSpec.forCardAndSpec(
                {},
                {
                    forOpponent: [
                        {
                            type: "drawCard",
                            count: 1,
                            common: true,
                            ifAddedAddAlso: [
                                {
                                    forOpponent: [],
                                    forPlayer: [
                                        {
                                            type: "drawCard",
                                            count: 0,
                                            common: true,
                                            waiting: true,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    forPlayer: [],
                }
            );
        },
        "should try to add requirement to opponent"() {
            assert.calledOnce(
                this.opponentRequirementService.addCardRequirement
            );
        },
        "should NOT try to add extra requirement to player"() {
            refute.called(
                this.playerRequirementService.addEmptyCommonWaitingRequirement
            );
        },
    },
};
