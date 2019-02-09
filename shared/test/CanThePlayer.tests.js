let {
    sinon,
    testCase,
    defaults,
    refute,
    assert
} = require('bocha');
const BaseCard = require('../card/BaseCard.js');
const DisturbingSensor = require('../card/DisturbingSensor.js');
const CanThePlayer = require('../match/CanThePlayer.js');

const {
    createCard
} = require('./shared.js');

module.exports = testCase('CanThePlayer', {
    'when card is of type spaceShip': {
        setUp() {
            this.card = createCard(BaseCard, {
                card: { type: 'spaceShip' }
            });
            this.canThePlayer = new CanThePlayer();
        },
        'card can move'() {
            assert(this.canThePlayer.moveThisCard(this.card));
        },
        'card can attack'() {
            assert(this.canThePlayer.attackWithThisCard(this.card));
        }
    },
    'when card is of type missile and opponent has "Disturbing sensor" in play': {
        setUp() {
            this.card = createCard(BaseCard, {
                card: { type: 'missile' }
            });
            const disturbingSensor = {
                preventsOpponentMissilesFromMoving: true,
                preventsOpponentMissilesFromAttacking: true
            };
            this.canThePlayer = new CanThePlayer({
                opponentStateService: {
                    hasMatchingCardInSomeZone: matcher => matcher(disturbingSensor)
                }
            });
        },
        'card can NOT move'() {
            refute(this.canThePlayer.moveThisCard(this.card));
        },
        'card can NOT attack'() {
            refute(this.canThePlayer.attackWithThisCard(this.card));
        }
    }
});