const bocha = require('../testUtils/bocha-jest/bocha');
const assert = bocha.assert;
const refute = bocha.refute;
const Commander = require('../../match/commander/Commander.js');
const createState = require('../fakeFactories/createState.js');
const FakeCardDataAssembler = require("../testUtils/FakeCardDataAssembler.js");//TODO Move to shared
const createCard = FakeCardDataAssembler.createCard;
const TestHelper = require('../fakeFactories/TestHelper.js');

module.exports = {
    'pass draw phase': {
        'can pass, when is draw phase and player deck is empty'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        cardsInDeck: []
                    },
                    'P2A': {
                        cardsInDeck: [{}]
                    }
                }
            }));

            const service = testHelper.playerDrawPhase('P1A');

            assert(service.canPass());
        },
        'can NOT pass, when is NOT draw phase but player deck is empty'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsInDeck: []
                    },
                    'P2A': {
                        cardsInDeck: [{}]
                    }
                }
            }));

            const service = testHelper.playerDrawPhase('P1A');

            refute(service.canPass());
        },
        'can NOT pass, when is draw phase but player deck is NOT empty'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        cardsInDeck: [{}]
                    },
                    'P2A': {
                        cardsInDeck: [{}]
                    }
                }
            }));

            const service = testHelper.playerDrawPhase('P1A');

            refute(service.canPass());
        },
        'can NOT pass, when is draw phase and player deck is empty, BUT CAN MILL'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        cardsInDeck: [],
                        commanders: [Commander.TheMiller]
                    },
                    'P2A': {
                        cardsInDeck: [createCard()]
                    }
                }
            }));

            const service = testHelper.playerDrawPhase('P1A');

            refute(service.canPass());
        }
    }
};
