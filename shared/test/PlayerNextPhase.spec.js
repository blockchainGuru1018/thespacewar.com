const PlayerNextPhase = require('../match/PlayerNextPhase.js')

describe('Player wants to move for next phase',()=>{
        const mockPlayerRetreat = jest.fn(() => {})
        const mockGameIsHumanVsHuman = (v) => () => v;
    it('Should NOT end game if is playing with a BOT', ()=>{
        const playerNextPhase = createPlayerNextPhase(
            mockGameIsHumanVsHuman(false),
            mockPlayerRetreat)
        playerNextPhase.endTurnForPlayer()
        expect(mockPlayerRetreat).toHaveBeenCalledTimes(0);
    })
    it('Should end game if is playing with a human', ()=>{
        const playerNextPhase = createPlayerNextPhase(
            mockGameIsHumanVsHuman(true),
            mockPlayerRetreat)
        playerNextPhase.endTurnForPlayer()
        expect(mockPlayerRetreat).toHaveBeenCalledTimes(1);
    })
})

function createPlayerNextPhase(gameIsHumanVsHuman,mockPlayerRetreat){
    const playerNextPhase = new PlayerNextPhase({
        matchService : {
            getLastPlayerId: () => 'P2A',
            goToNextPlayer: () => {},
            playerRetreat: mockPlayerRetreat, 
            gameIsHumanVsHuman
        },
        playerStateService : {
            getPlayerId: () => 'P1A'
        },
        playerPhase : {
            set: () => {}
        },
        canThePlayer : {},
        playerCommanders : {},
        playerGameTimer : {
            hasEnded: () => true
        },
        playerDiscardPhase : {},
        addRequirementFromSpec : {},
        opponentStateService : {},
    });
    return playerNextPhase;
}