const { assert, defaults, refute } = require("../testUtils/bocha-jest/bocha");
const MoveCardEvent = require("../../event/MoveCardEvent.js");
const BaseCard = require("../../card/BaseCard.js");
const Slow = require("../../card/mixins/Slow.js");
const SmallRepairShop = require("../../card/SmallRepairShop.js");
const FastMissile = require("../../card/FastMissile.js");
const NuclearMissile = require("../../card/NuclearMissile.js");
const EmpMissile = require("../../card/EmpMissile.js");
const EnergyShield = require("../../card/EnergyShield.js");
const Pursuiter = require("../../card/Pursuiter.js");
const CanBePutDownAnyTime = require("../../card/mixins/CanBePutDownAnyTime.js");
const CanCounterCardsWithCostOrLess = require("../../card/mixins/CanCounterCardsWithCostOrLess.js");
const canThePlayerFactory = require("../fakeFactories/canThePlayerFactory.js");
const playerStateServiceFactory = require("../fakeFactories/playerStateServiceFactory.js");
const playerRuleServiceFactory = require("../fakeFactories/playerRuleServiceFactory.js");
const queryEventsFactory = require("../fakeFactories/queryEventsFactory.js");
const { createCard } = require("../testUtils/shared.js");

module.exports = {
    "misc:": {
        "when card has 1 attack but has attack boost of 1": {
            async setUp() {
                this.card = createCard(BaseCard, {
                    card: { id: "C1A", attack: 1, type: "spaceShip" },
                    cardEffect: {
                        attackBoostForCardType: (type) =>
                            type === "spaceShip" ? 1 : 0,
                    },
                });
            },
            "card should have attack of 2"() {
                assert.equals(this.card.attack, 2);
            },
        },
        "when card was put down this turn": {
            async setUp() {
                this.card = createCard(BaseCard, {
                    card: { id: "C1A", attack: 1 },
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => "attack",
                    }),
                    matchService: {
                        getTurn: () => 1,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1,
                    }),
                });
            },
            "should NOT be able to move"() {
                refute(this.card.canMove());
            },
        },
        "when card was put down this turn and cardEffect says it can move on turn when put down": {
            async setUp() {
                this.card = createCard(BaseCard, {
                    card: { id: "C1A", attack: 1, type: "spaceShip" },
                    cardEffect: {
                        cardTypeCanMoveOnTurnPutDown: (type) =>
                            type === "spaceShip",
                    },
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => "attack",
                    }),
                    matchService: {
                        getTurn: () => 1,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1,
                    }),
                });
            },
            "should be able to move"() {
                assert(this.card.canMove());
            },
        },
    },
    "Small Repair Shop:": {
        "Small Repair Shop should be able to move on turn when put down"() {
            this.card = createCard(SmallRepairShop, {
                card: { id: "C1A", attack: 1 },
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getMovesOnTurn: () => [],
                    getTurnWhenCardWasPutDown: () => 1,
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                }),
            });

            assert(this.card.canMove());
        },
        "when repair other ship with 1 damage and that is paralyzed": {
            setUp() {
                this.card = createCard(SmallRepairShop, {
                    card: { id: "C1A", attack: 1 },
                    matchService: {
                        getTurn: () => 1,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1,
                    }),
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => "attack",
                    }),
                });
                this.otherCard = createCard(BaseCard, {
                    card: { paralyzed: true, damage: 1 },
                });

                this.card.repairCard(this.otherCard);
            },
            "should make it NOT paralyzed"() {
                refute(this.otherCard.paralyzed);
            },
            "should NOT repair any damage"() {
                assert.equals(this.otherCard.damage, 1);
            },
        },
        "when has attacked this turn should NOT be able to repair": {
            setUp() {
                this.card = createCard(SmallRepairShop, {
                    card: { id: "C1A", attack: 1 },
                    matchService: {
                        getTurn: () => 1,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1,
                        getAttacksOnTurn: (cardId, turn) =>
                            cardId === "C1A" && turn === 1 ? [{}] : [],
                    }),
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => "attack",
                        hasMatchingCardInSomeZone: (matcher) =>
                            matcher({ canBeRepaired: () => true }),
                    }),
                });
            },
            "should NOT be able to repair"() {
                refute(this.card.canRepair());
            },
        },
        "when has repaired this turn should NOT be able to attack": {
            setUp() {
                this.card = createCard(SmallRepairShop, {
                    card: { id: "C1A", attack: 1 },
                    matchService: {
                        getTurn: () => 1,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1,
                        getRepairsOnTurn: (cardId, turn) =>
                            cardId === "C1A" && turn === 1 ? [{}] : null,
                        getAttacksOnTurn: () => [],
                    }),
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => "attack",
                        hasMatchingCardInSomeZone: (matcher) =>
                            matcher({ canBeRepaired: () => true }),
                    }),
                });
            },
            "should NOT be able to attack"() {
                refute(this.card.canAttack());
            },
        },
        "when is paralyzed should NOT be able to repair": {
            setUp() {
                this.card = createCard(SmallRepairShop, {
                    card: { id: "C1A", paralyzed: true },
                    queryEvents: queryEventsFactory.withStubs(),
                    playerStateService: playerStateServiceFactory.withStubs(),
                });
            },
            "should NOT be able to repair"() {
                refute(this.card.canRepair());
            },
        },
        "when other card belongs to the opponent should NOT be able to repair that card": {
            setUp() {
                this.card = createCard(SmallRepairShop, {
                    card: { id: "C1A", paralyzed: true },
                    queryEvents: queryEventsFactory.withStubs(),
                    playerStateService: playerStateServiceFactory.withStubs(),
                });
            },
            "should NOT be able to repair"() {
                refute(this.card.canRepair());
            },
        },
        "when is in home zone and has flipped station card should be able to repair": function () {
            this.card = createCard(SmallRepairShop, {
                card: { id: "C1A" },
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: queryEventsFactory.withStubs(),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardInHomeZone: (id) => id === "C1A",
                    hasFlippedStationCards: () => true,
                }),
            });

            assert(this.card.canRepair());
        },
        "when is NOT in home zone and has flipped station card should NOT be able to repair": function () {
            this.card = createCard(SmallRepairShop, {
                card: { id: "C1A" },
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: queryEventsFactory.withStubs(),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardInHomeZone: (id) => id !== "C1A",
                    hasFlippedStationCards: () => true,
                }),
            });

            refute(this.card.canRepair());
        },
        "when is NOT in home zone and has flipped station card and has paralyzed card in same zone should be able to repair": function () {
            this.card = createCard(SmallRepairShop, {
                card: { id: "C1A" },
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: queryEventsFactory.withStubs(),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardInHomeZone: (id) => id !== "C1A",
                    hasFlippedStationCards: () => true,
                    hasMatchingCardInSameZone: (id) => id === "C1A",
                }),
            });

            assert(this.card.canRepair());
        },
    },
    "Pursuiter:": {
        "when has moved to opponent zone previous turn should be able to target a station card for sacrifice": async function () {
            const stationCard = createCard(BaseCard, {
                card: { id: "C2A" },
                playerStateService: {
                    isCardStationCard: (cardId) => cardId === "C2A",
                },
            });
            this.card = createCard(Pursuiter, {
                card: { id: "C1A", attack: 1 },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 2,
                    cardsAreInSameZone: (card, otherCard) =>
                        card.id === "C1A" && otherCard.id === "C2A",
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: () => false,
                    hasMovedOnPreviousTurn: () => true,
                    getTurnWhenCardWasPutDown: () => 1,
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    isCardInHomeZone: () => false,
                    getPhase: () => "attack",
                    isCardStationCard: () => false,
                }),
            });

            assert(this.card.canTargetCardForSacrifice(stationCard));
        },
        "when has moved to opponent zone this turn should NOT be able to target a station card for sacrifice": async function () {
            const stationCard = createCard(BaseCard, {
                card: { id: "C2A" },
                isStationCard: true,
                playerStateService: playerStateServiceFactory.withStubs({
                    isCardStationCard: (cardId) => cardId === "C2A",
                }),
            });
            this.card = createCard(BaseCard, {
                card: { id: "C1A", attack: 1 },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 2,
                    cardsAreInSameZone: (card, otherCard) =>
                        card.id === "C1A" && otherCard.id === "C2A",
                },
                queryEvents: queryEventsFactory.withStubs({
                    hasMovedOnTurn: (cardId, turn) =>
                        cardId === "C1A" && turn === 2,
                    getTurnWhenCardWasPutDown: () => 1,
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    isCardInHomeZone: () => false,
                    getPhase: () => "attack",
                }),
            });

            refute(this.card.canTargetCardForSacrifice(stationCard));
        },
        "when pursuiter was put down this turn should NOT be sacrificable"() {
            this.card = createCard(Pursuiter, {
                card: { id: "C1A", attack: 1 },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getTurnWhenCardWasPutDown: () => 1,
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                }),
            });

            refute(this.card.canBeSacrificed());
        },
        "when has attacked this turn should NOT be able to sacrifice"() {
            this.card = createCard(Pursuiter, {
                card: { id: "C1A", attack: 1 },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getTurnWhenCardWasPutDown: () => 1,
                    getAttacksOnTurn: () => [{}],
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                }),
            });

            refute(this.card.canBeSacrificed());
        },
        "when is NOT attack phase should NOT be able to sacrifice"() {
            this.card = createCard(Pursuiter, {
                card: { id: "C1A", attack: 1 },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getTurnWhenCardWasPutDown: () => 1,
                    getAttacksOnTurn: () => [],
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "draw",
                }),
            });

            refute(this.card.canBeSacrificed());
        },
    },
    "Nuclear missile:": {
        "when card is NOT Nuclear Missile and has moved this turn should be able to attack": function () {
            this.card = createCard(BaseCard, {
                card: { id: "C1A", attack: 1 },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    getMovesOnTurn: () => [
                        MoveCardEvent({ turn: 2, cardId: "C1A" }),
                    ],
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                }),
            });

            assert(this.card.canAttack());
        },
        "when card has moved this turn should NOT be able to attack": function () {
            this.card = createCard(NuclearMissile, {
                card: { id: "C1A", attack: 1 },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: (cardId, turn) =>
                        cardId === "C1A" && turn === 2,
                    getMovesOnTurn: () => [
                        MoveCardEvent({ turn: 2, cardId: "C1A" }),
                    ],
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                }),
            });

            refute(this.card.canAttack());
        },
        "should NOT be able to attack cards in opposite zone": function () {
            const card = createCard(NuclearMissile, {
                player: "P1A",
                card: { id: "C1A", attack: 1, type: "missile" },
                canThePlayer: canThePlayerFactory.withStubs({
                    attackStationCards: () => true,
                    attackWithThisCard: () => true,
                    moveThisCard: () => true,
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardInHomeZone: () => true,
                }),
                matchService: {
                    getTurn: () => 2,
                    cardsAreInSameZone: () => false,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: () => false,
                    getTurnWhenCardWasPutDown: () => 1,
                }),
            });
            const targetCard = createCard(BaseCard, {
                playerId: "P2A",
                card: { id: "C2A", type: "spaceShip" },
            });

            refute(card.canAttackCard(targetCard));
        },
    },
    "Slow (general behaviour, cannot move and attack on the same turn)": {
        "when card has attacked this turn some NOT be able to move": function () {
            this.card = createCard(Slow(BaseCard), {
                card: { id: "C1A", attack: 1 },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [{}],
                    hasMovedOnTurn: () => false,
                    getMovesOnTurn: () => [],
                    getTurnWhenCardWasPutDown: (cardId) => cardId === "C1A",
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                }),
            });

            refute(this.card.canMove());
        },
    },
    "Disturbing sensor:": {
        "when missile normally can both move and attack and opponent does NOT have Disturbing sensor in play": {
            setUp() {
                this.card = createCard(BaseCard, {
                    card: { id: "C1A", attack: 1, type: "missile" },
                    playerId: "P1A",
                    matchService: {
                        getTurn: () => 2,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getTurnWhenCardWasPutDown: () => 1,
                        getAttacksOnTurn: () => [],
                        getMovesOnTurn: () => [],
                    }),
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => "attack",
                    }),
                    canThePlayer: canThePlayerFactory.withStubs({
                        moveThisCard: (card) => card.id === "C1A",
                        attackWithThisCard: (card) => card.id === "C1A",
                    }),
                });
            },
            "should be able to move": function () {
                assert(this.card.canMove());
            },
            "should be able to attack": function () {
                assert(this.card.canAttack());
            },
        },
        "when missile normally can both move and attack but opponent has Disturbing sensor in play": {
            setUp() {
                this.card = createCard(BaseCard, {
                    card: { id: "C1A", attack: 1, type: "missile" },
                    playerId: "P1A",
                    matchService: {
                        getTurn: () => 2,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getTurnWhenCardWasPutDown: () => 1,
                        getAttacksOnTurn: () => [],
                        getMovesOnTurn: () => [],
                    }),
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => "attack",
                    }),
                    canThePlayer: canThePlayerFactory.withStubs({
                        moveThisCard: (card) => card.id !== "C1A",
                        attackWithThisCard: (card) => card.id !== "C1A",
                    }),
                });
            },
            "should NOT be able to move": function () {
                refute(this.card.canMove());
            },
            "should NOT be able to attack": function () {
                refute(this.card.canAttack());
            },
        },
    },
    "EMP Missile:": {
        "when EmpMissile attacks spaceShip": {
            setUp() {
                this.card = createCard(EmpMissile, {
                    card: { id: "C1A", attack: 1 },
                    playerId: "P1A",
                    matchService: {
                        getTurn: () => 2,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getAttacksOnTurn: () => [],
                        hasMovedOnTurn: (cardId, turn) =>
                            cardId === "C1A" && turn === 2,
                        getMovesOnTurn: () => [
                            MoveCardEvent({ turn: 2, cardId: "C1A" }),
                        ],
                    }),
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => "attack",
                    }),
                });
                this.otherCard = createCard(BaseCard, {
                    card: { type: "spaceShip", damage: 0 },
                });

                this.card.attackCard(this.otherCard);
            },
            "should paralyze ship": function () {
                assert(this.otherCard.paralyzed);
            },
            "should NOT damage ship": function () {
                assert.equals(this.otherCard.damage, 0);
            },
            "should have destroyed self": function () {
                assert(this.card.destroyed);
            },
        },
        "when EmpMissile attacks Energy Shield": {
            setUp() {
                this.card = createCard(EmpMissile, {
                    card: { id: "C1A", attack: 1 },
                    playerId: "P1A",
                    matchService: {
                        getTurn: () => 2,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getAttacksOnTurn: () => [],
                        hasMovedOnTurn: (cardId, turn) =>
                            cardId === "C1A" && turn === 2,
                        getMovesOnTurn: () => [
                            MoveCardEvent({ turn: 2, cardId: "C1A" }),
                        ],
                    }),
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => "attack",
                    }),
                });
                this.otherCard = createCard(EnergyShield, {
                    card: {
                        commonId: EnergyShield.CommonId,
                        type: "defense",
                        damage: 0,
                    },
                });

                this.card.attackCard(this.otherCard);
            },
            "should destroy ship": function () {
                assert(this.otherCard.destroyed);
            },
            "should NOT paralyze ship": function () {
                refute(this.otherCard.paralyzed);
            },
            "should have destroyed self": function () {
                assert(this.card.destroyed);
            },
        },
        "when EmpMissile attacks basic defense card": {
            setUp() {
                this.card = createCard(EmpMissile, {
                    card: { id: "C1A" },
                    playerId: "P1A",
                    matchService: {
                        getTurn: () => 2,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getAttacksOnTurn: () => [],
                        hasMovedOnTurn: (cardId, turn) =>
                            cardId === "C1A" && turn === 2,
                        getMovesOnTurn: () => [
                            MoveCardEvent({ turn: 2, cardId: "C1A" }),
                        ],
                    }),
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => "attack",
                    }),
                });
                this.otherCard = createCard(BaseCard, {
                    card: { type: "defense", damage: 0 },
                });

                this.error = catchError(() =>
                    this.card.attackCard(this.otherCard)
                );
            },
            "should NOT destroy ship": function () {
                refute(this.otherCard.destroyed);
            },
            "should NOT damage ship": function () {
                assert.equals(this.otherCard.damage, 0);
            },
            "should NOT paralyze ship": function () {
                refute(this.otherCard.paralyzed);
            },
            "should have destroyed self": function () {
                assert(this.card.destroyed);
            },
        },
        "when EmpMissile should NOT be able to attack station cards"() {
            this.card = createCard(EmpMissile, {
                card: { id: "C1A", type: "missile" },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: (cardId, turn) =>
                        cardId === "C1A" && turn === 1,
                    getMovesOnTurn: () => [
                        MoveCardEvent({ turn: 1, cardId: "C1A" }),
                    ],
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardInHomeZone: () => false,
                }),
            });

            refute(this.card.canAttackStationCards());
        },
        "when EmpMissile should NOT be able to attack paralyzed cards"() {
            this.card = createCard(EmpMissile, {
                card: { id: "C1A", type: "missile" },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: (cardId, turn) =>
                        cardId === "C1A" && turn === 1,
                    getMovesOnTurn: () => [
                        MoveCardEvent({ turn: 1, cardId: "C1A" }),
                    ],
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardInHomeZone: () => false,
                }),
            });

            refute(
                this.card.canAttackCard({
                    canBeTargeted: () => true,
                    paralyzed: true,
                })
            );
        },
        "EMP Missile should be able to attack energy shields"() {
            this.card = createCard(EmpMissile, {
                card: { id: "C1A", type: "missile" },
                playerId: "P1A",
                matchService: {
                    getTurn: () => 1,
                    cardsAreInSameZone: (card, otherCard) =>
                        card.id === "C1A" && otherCard.id === "C2A",
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: (cardId, turn) =>
                        cardId === "C1A" && turn === 1,
                    getMovesOnTurn: () => [
                        MoveCardEvent({ turn: 1, cardId: "C1A" }),
                    ],
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardInHomeZone: () => false,
                }),
            });

            const energyShield = {
                id: "C2A",
                canBeTargeted: () => true,
                type: "defense",
                commonId: EnergyShield.CommonId,
            };
            assert(this.card.canAttackCard(energyShield));
        },
    },
    "when card is paralyzed": {
        setUp() {
            this.card = createCard(BaseCard, {
                card: { id: "C1A", attack: 1, paralyzed: true },
                canThePlayer: canThePlayerFactory.withStubs({
                    attackWithThisCard: () => true,
                    moveThisCard: () => true,
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardStationCard: () => false,
                }),
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: {
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: () => false,
                    getTurnWhenCardWasPutDown: () => 1,
                },
            });
        },
        "should be able to target for attack"() {
            assert(this.card.canBeTargeted());
        },
        "should NOT be able to attack"() {
            refute(this.card.canAttack());
        },
        "should NOT be able to move"() {
            refute(this.card.canMove());
        },
        "can be repaired"() {
            assert(this.card.canBeRepaired());
        },
    },
    "Fast missile": {
        "when was played in home zone this turn can attack station cards"() {
            const card = createCard(FastMissile, {
                card: { id: "C1A", attack: 1, type: "missile" },
                canThePlayer: canThePlayerFactory.withStubs({
                    attackStationCards: () => true,
                    attackWithThisCard: () => true,
                    moveThisCard: () => true,
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardInHomeZone: () => true,
                }),
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: () => false,
                    getTurnWhenCardWasPutDown: () => 1,
                }),
            });
            assert(card.canAttackStationCards());
        },
        "when was played in home zone this turn can attack cards in the opposite zone"() {
            const card = createCard(FastMissile, {
                player: "P1A",
                card: { id: "C1A", attack: 1, type: "missile" },
                canThePlayer: canThePlayerFactory.withStubs({
                    attackStationCards: () => true,
                    attackWithThisCard: () => true,
                    moveThisCard: () => true,
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardInHomeZone: () => true,
                }),
                matchService: {
                    getTurn: () => 1,
                    cardsAreInSameZone: () => false,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: () => false,
                    getTurnWhenCardWasPutDown: () => 1,
                }),
            });
            const targetCard = createCard(BaseCard, {
                playerId: "P2A",
                card: { id: "C2A", type: "spaceShip" },
            });

            assert(card.canAttackCard(targetCard));
        },
    },
    "Missile (in general)": {
        "when was played in home zone the previous turn can attack cards in the opposite zone"() {
            const card = createCard(BaseCard, {
                player: "P1A",
                card: { id: "C1A", attack: 1, type: "missile" },
                canThePlayer: canThePlayerFactory.withStubs({
                    attackStationCards: () => true,
                    attackWithThisCard: () => true,
                    moveThisCard: () => true,
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => "attack",
                    isCardInHomeZone: () => true,
                }),
                matchService: {
                    getTurn: () => 2,
                    cardsAreInSameZone: () => false,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: () => false,
                    getTurnWhenCardWasPutDown: () => 1,
                }),
            });
            const targetCard = createCard(BaseCard, {
                playerId: "P2A",
                card: { id: "C2A", type: "spaceShip" },
            });

            assert(card.canAttackCard(targetCard));
        },
    },
    "canBePlayed = true": {
        "when is event card and can put down event cards"() {
            const card = createCard(BaseCard, {
                playerRuleService: playerRuleServiceFactory.withStubs({
                    canPutDownEventCards: () => true,
                }),
                card: { type: "event" },
            });

            assert(card.canBePlayed());
        },
        "when is NOT event card and can NOT put down event cards"() {
            const card = createCard(BaseCard, {
                playerRuleService: playerRuleServiceFactory.withStubs({
                    canPutDownEventCards: () => false,
                }),
                card: { type: "spaceShip" },
            });

            assert(card.canBePlayed());
        },
    },
    "canBePlayed = false": {
        "when is event card and can NOT put down event cards"() {
            const card = createCard(BaseCard, {
                playerRuleService: playerRuleServiceFactory.withStubs({
                    canPutDownEventCards: () => false,
                }),
                card: { type: "event" },
            });

            refute(card.canBePlayed());
        },
        "when cannot afford card"() {
            const card = createCard(BaseCard, {
                card: {},
                canThePlayer: {
                    affordCard: () => false,
                },
            });

            refute(card.canBePlayed());
        },
        "when card is event card and can play event cards and cannot afford card"() {
            const card = createCard(BaseCard, {
                playerRuleService: playerRuleServiceFactory.withStubs({
                    canPutDownEventCards: () => true,
                }),
                card: { type: "event" },
                canThePlayer: {
                    affordCard: () => false,
                },
            });

            refute(card.canBePlayed());
        },
    },
    "when can and can not play card": {
        "can only has one of type in play but has NONE in play"() {
            const card = createCard(EnergyShield, {
                playerStateService: playerStateServiceFactory.withStubs({
                    hasCardOfTypeInZone: () => false,
                }),
            });
            assert(card.canBePlayed());
        },
        "can only has one of type in play and has one already"() {
            const card = createCard(EnergyShield, {
                playerStateService: playerStateServiceFactory.withStubs({
                    hasCardOfTypeInZone: (commonId) =>
                        commonId === EnergyShield.CommonId,
                }),
            });
            refute(card.canBePlayed());
        },
        "when can NOT play cards in home zone"() {
            const card = createCard(BaseCard, {
                playerRuleService: playerRuleServiceFactory.withStubs({
                    canPutDownCardsInHomeZone: () => false,
                }),
            });
            refute(card.canBePlayed());
        },
        "when has control of opponents turn and card costs MORE than 0"() {
            const card = createCard(BaseCard, {
                card: { cost: 1 },
                turnControl: { playerHasControlOfOpponentsTurn: () => true },
            });
            refute(card.canBePlayed());
        },
        "when has control of opponents turn and card costs 0"() {
            const card = createCard(BaseCard, {
                card: { cost: 0 },
                turnControl: { playerHasControlOfOpponentsTurn: () => true },
            });
            assert(card.canBePlayed());
        },
        "when can be put down any time when is event card and game is on, but cannot generally play cards"() {
            const card = createCard(CanBePutDownAnyTime(BaseCard), {
                card: { type: "event" },
                matchService: { isGameOn: () => true },
                playerRuleService: playerRuleServiceFactory.withStubs({
                    canPutDownCardsInHomeZone: () => false,
                }),
            });
            assert(card.canBePlayed());
        },
    },
};

function catchError(callback) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}
