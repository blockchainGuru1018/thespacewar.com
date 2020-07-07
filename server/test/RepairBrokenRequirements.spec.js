const setupIntegrationTest = require('./testUtils/setupIntegrationTest.js');

describe('Repair draw card requirement', () => {
    test('When send "start" signal to match and opponent has NO cards in their deck, should remove requirement', () => {
        const {match, secondPlayerAsserter} = setupIntegrationTest({
            playerStateById: {
                'P1A': {
                    requirements: [
                        {
                            type: 'drawCard',
                            count: 0,
                            common: true,
                            waiting: true
                        }
                    ] 
                },
                'P2A': {
                    requirements: [
                        {
                            type: 'drawCard',
                            count: 1,
                            common: true,
                            waiting: true
                        }
                    ],
                    cardsInDeck: []
                }
            }
        });
        
        match.start('P2A');

        secondPlayerAsserter.refuteHasRequirement({type: 'drawCard'});
    });
    test('When send "start" signal to match and opponent has cards in their deck, should NOT remove requirement', () => {
        const {match, secondPlayerAsserter} = setupIntegrationTest({
            playerStateById: {
                'P1A': {
                    requirements: [
                        {
                            type: 'drawCard',
                            count: 0,
                            common: true,
                            waiting: true
                        }
                    ] 
                },
                'P2A': {
                    requirements: [
                        {
                            type: 'drawCard',
                            count: 1,
                            common: true,
                            waiting: true
                        }
                    ],
                    cardsInDeck: [{id: 'C1A'}]
                }
            }
        });
        
        match.start('P2A');

        secondPlayerAsserter.hasRequirement({type: 'drawCard'});
    });
});