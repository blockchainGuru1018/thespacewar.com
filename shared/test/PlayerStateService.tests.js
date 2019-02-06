let bocha = require('bocha');
let sinon = bocha.sinon;
let assert = bocha.assert;
let refute = bocha.refute;
let defaults = bocha.defaults;
const FakeCardDataAssembler = require("../../server/test/testUtils/FakeCardDataAssembler.js");//TODO Move to shared
const createCard = FakeCardDataAssembler.createCard;
const ServerCardFactory = require('../../server/card/ServerCardFactory.js');
const PlayerStateService = require('../match/PlayerStateService.js');
const BaseCard = require('../card/BaseCard.js');
const MatchService = require('../match/MatchService.js');
const FakeDeckFactory = require('../../server/test/testUtils/FakeDeckFactory.js')

const FullForceForwardCommonId = '9';

module.exports = bocha.testCase('PlayerStateService', {
    'attack bonus:': {
        'when has card Full Force Forward in play and a SPACE SHIP card asks for its attack bonus': {
            async setUp() {
                const C1A = createCard({ id: 'C1A', type: 'spaceShip' });
                const card = new BaseCard({ card: C1A });
                const state = createState({
                    playerStateById: {
                        'P1A': {
                            cardsInZone: [C1A, createFullForceForward('C2A')]
                        }
                    }
                });
                const service = createServiceForPlayer(state, 'P1A');

                this.bonus = service.getAttackBonusForCard(card);
            },
            'should return 1 in attack bonus': function () {
                assert.equals(this.bonus, 1);
            }
        },
        'when has card Full Force Forward in play and a MISSILE card asks for its attack bonus': {
            async setUp() {
                const C1A = createCard({ id: 'C1A', type: 'missile' });
                const card = new BaseCard({ card: C1A });
                const state = createState({
                    playerStateById: {
                        'P1A': {
                            cardsInZone: [C1A, createFullForceForward('C2A')]
                        }
                    }
                });
                const service = createServiceForPlayer(state, 'P1A');

                this.bonus = service.getAttackBonusForCard(card);
            },
            'should return 0 in attack bonus': function () {
                assert.equals(this.bonus, 0);
            }
        },
        'when does NOT have Full Force Forward in play and a SPACE SHIP card asks for its attack bonus': {
            async setUp() {
                const C1A = createCard({ id: 'C1A', type: 'spaceShip' });
                const card = new BaseCard({ card: C1A });
                const state = createState({
                    playerStateById: {
                        'P1A': {
                            cardsInZone: [C1A]
                        }
                    }
                });
                const service = createServiceForPlayer(state, 'P1A');

                this.bonus = service.getAttackBonusForCard(card);
            },
            'should return 0 in attack bonus': function () {
                assert.equals(this.bonus, 0);
            }
        },
        'when have 1 duration card that is NOT Full Force Forward in play and a SPACE SHIP card asks for its attack bonus': {
            async setUp() {
                const C1A = createCard({ id: 'C1A', type: 'spaceShip' });
                const card = new BaseCard({ card: C1A });
                const state = createState({
                    playerStateById: {
                        'P1A': {
                            cardsInZone: [C1A, createCard({ id: 'C2A', type: 'duration' })]
                        }
                    }
                });
                const service = createServiceForPlayer(state, 'P1A');

                this.bonus = service.getAttackBonusForCard(card);
            },
            'should return 0 in attack bonus': function () {
                assert.equals(this.bonus, 0);
            }
        }
    }
});

function createFullForceForward(id) {
    return createCard({ id, type: 'duration', commonId: FullForceForwardCommonId });
}

function createServiceForPlayer(state, playerId) {
    const matchService = new MatchService();
    matchService.setState(state);
    return new PlayerStateService({
        playerId,
        matchService,
        cardFactory: new ServerCardFactory({ matchService, getFreshState: () => state })
    });
}

function createState(options = {}) {
    defaults(options, {
        turn: 1,
        currentPlayer: 'P1A',
        playerOrder: ['P1A', 'P2A'],
        playerStateById: {},
        deckByPlayerId: {}
    });

    const playerStateIds = Object.keys(options.playerStateById);
    if (playerStateIds.length < 2) {
        playerStateIds.push(options.playerOrder[1]);
    }
    for (let key of playerStateIds) {
        options.playerStateById[key] = createPlayerState(options.playerStateById[key]);
    }

    for (let playerId of options.playerOrder) {
        if (!options.deckByPlayerId[playerId]) {
            options.deckByPlayerId[playerId] = FakeDeckFactory.createDeckFromCards([FakeCardDataAssembler.createCard()]);
        }
        if (!options.playerStateById[playerId]) {
            options.playerStateById[playerId] = createPlayerState();
        }
    }

    return options;
}

function createPlayerState(options = {}) {
    return defaults(options, {
        phase: 'wait',
        cardsOnHand: [],
        cardsInZone: [],
        cardsInOpponentZone: [],
        stationCards: [],
        discardedCards: [],
        events: [],
        requirements: []
    });
}