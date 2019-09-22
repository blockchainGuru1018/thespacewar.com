const {
    testCase,
    assert
} = require('bocha');
const CardEffect = require('../match/CardEffect.js');

module.exports = testCase('CardEffect', {
    'attack boost:': {
        'when has duration card that gives attack boost of 1 should return 1'() {
            const cardEffect = CardEffect({
                playerStateService: {
                    getDurationBehaviourCards: () => [{ friendlySpaceShipAttackBonus: 1 }]
                },
                canThePlayer: {
                    useThisDurationCard: () => true
                }
            });

            assert.equals(cardEffect.attackBoostForCardType('spaceShip'), 1);
        },
        'when has duration card that gives attack boost of 2 should return 2'() {
            const cardEffect = CardEffect({
                playerStateService: {
                    getDurationBehaviourCards: () => [{ friendlySpaceShipAttackBonus: 2 }]
                },
                canThePlayer: {
                    useThisDurationCard: () => true
                }
            });

            assert.equals(cardEffect.attackBoostForCardType('spaceShip'), 2);
        },
        'when has 2 duration cards and second one gives attack boost should return that'() {
            const cardEffect = CardEffect({
                playerStateService: {
                    getDurationBehaviourCards: () => [
                        {},
                        { friendlySpaceShipAttackBonus: 1 }
                    ]
                },
                canThePlayer: {
                    useThisDurationCard: () => true
                }
            });

            assert.equals(cardEffect.attackBoostForCardType('spaceShip'), 1);
        },
        'when has 2 duration cards with attack boost should return sum of both'() {
            const cardEffect = CardEffect({
                playerStateService: {
                    getDurationBehaviourCards: () => [
                        { friendlySpaceShipAttackBonus: 1 },
                        { friendlySpaceShipAttackBonus: 1 }
                    ]
                },
                canThePlayer: {
                    useThisDurationCard: () => true
                }
            });

            assert.equals(cardEffect.attackBoostForCardType('spaceShip'), 2);
        },
        'when has 2 duration cards with attack boost, but only one can be used should return value from the usable card'() {
            const cardEffect = CardEffect({
                playerStateService: {
                    getDurationBehaviourCards: () => [
                        { id: 'C1A', friendlySpaceShipAttackBonus: 1 },
                        { id: 'C2A', friendlySpaceShipAttackBonus: 3 }
                    ]
                },
                canThePlayer: {
                    useThisDurationCard: cardId => cardId === 'C2A'
                }
            });

            assert.equals(cardEffect.attackBoostForCardType('spaceShip'), 3);
        },
        'when card is NOT of type spaceShip should return 0, even if has usable duration card with boost of 1'() {
            const cardEffect = CardEffect({
                playerStateService: {
                    getDurationBehaviourCards: () => [
                        { friendlySpaceShipAttackBonus: 1 },
                    ]
                },
                canThePlayer: {
                    useThisDurationCard: () => true
                }
            });

            assert.equals(cardEffect.attackBoostForCardType('missile'), 0);
        }
    }
});
