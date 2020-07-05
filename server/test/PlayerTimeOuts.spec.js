const setupIntegrationTest = require('./testUtils/setupIntegrationTest.js');

describe('Player timeout', ()  =>{
   it('Only player that its not in wait phase must have timeouts' , () =>{
       const {match} = setupIntegrationTest({
           playerStateById: {
               'P1A': {
                   phase: 'wait',
                   stationCards: [stationCard({id: 'S1A'})]
               },
               'P2A': {
                   phase: 'action',
                   stationCards: [stationCard({id: 'S2A'})]
               }
           }
       });

       match.nextPhase('P1A', { currentPhase: 'wait' });

       expect(match.getTimeOutForPlayer('P1A')).toBeTruthy()
       expect(match.getTimeOutForPlayer('P2A')).toBeUndefined()
   });

    it('When player goes to wait phase timeout should be cleared' , () =>{
        const {match} = setupIntegrationTest({
            playerStateById: {
                'P1A': {
                    phase: 'wait',
                    stationCards: [stationCard({id: 'S1A'})]
                },
                'P2A': {
                    phase: 'action',
                    stationCards: [stationCard({id: 'S2A'})]
                }
            }
        });

        match.nextPhase('P2A', { currentPhase: 'attack' });

        expect(match.getTimeOutForPlayer('P2A')).toBeUndefined()
    });


});


function stationCard({place = 'draw', flipped = false, id}) {
    return {
        place,
        flipped,
        card: {id}
    };
}