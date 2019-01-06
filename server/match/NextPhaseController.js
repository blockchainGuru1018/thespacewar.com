const CheatError = require('./CheatError.js');
const itemNamesForOpponentByItemNameForPlayer = require('./itemNamesForOpponentByItemNameForPlayer.js');
const { COMMON_PHASE_ORDER, PHASES } = require('../../shared/phases.js');

function PutDownCardController(deps) {

    const {
        matchService,
        matchComService,
        cardFactory,
        playerServiceProvider
    } = deps;

    return {
        onNextPhase
    }

    function onNextPhase(playerId) {
        if (playerId !== matchService.getCurrentPlayer()) {
            throw new CheatError('Switching phase when not your own turn');
        }

        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        if (playerStateService.getPhase() === PHASES.preparation) {
            const actionPoints = playerStateService.getActionPointsForPlayer(playerId);
            if (actionPoints < 0) {
                throw new CheatError('Cannot go to next phase with less than 0 action points');
            }
        }

        if (playerStateService.getPhase() === PHASES.discard) {
            leaveDiscardPhaseForPlayer(matchService.getCurrentPlayer());
        }

        const isLastPhase = playerStateService.getPhase() === PHASES.attack;
        if (isLastPhase) {
            endTurnForCurrentPlayer();
        }
        else {
            const nextPhase = getNextPhase(playerStateService.getPhase());
            playerStateService.setPhase(nextPhase);
        }
    }

    function getNextPhase(currentPhase) {
        return COMMON_PHASE_ORDER[(COMMON_PHASE_ORDER.indexOf(currentPhase) + 1)];
    }

    function leaveDiscardPhaseForPlayer(playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerStationCards = playerStateService.getStationCards(playerId);
        const maxHandSize = getMaxHandSizeFromStationCards(playerStationCards);
        if (playerStateService.getCardsOnHandCount() > maxHandSize) {
            throw new CheatError('Cannot leave the discard phase without discarding enough cards');
        }
    }

    function endTurnForCurrentPlayer() {
        const currentPlayerId = matchService.getCurrentPlayer();
        const playerStateService = playerServiceProvider.getStateServiceById(currentPlayerId);
        playerStateService.setPhase(PHASES.wait);

        const isLastPlayerOfTurn = currentPlayerId === matchService.getLastPlayerId();
        if (isLastPlayerOfTurn) {
            matchService.goToNextTurn();
        }
        else {
            matchService.goToNextPlayer();
        }

        const newCurrentPlayerId = matchService.getCurrentPlayer();
        const currentPlayerStateService = playerServiceProvider.getStateServiceById(newCurrentPlayerId);
        const hasDurationCardInPlay = currentPlayerStateService.getCardsInZone().some(c => c.type === 'duration');
        if (hasDurationCardInPlay) {
            currentPlayerStateService.setPhase(PHASES.preparation);
        }
        else {
            currentPlayerStateService.setPhase(PHASES.draw);
        }

        emitNextPlayer();
    }

    function getMaxHandSizeFromStationCards(stationCards) {
        return stationCards
            .filter(c => c.place === 'handSize')
            .length * 3;
    }

    function emitNextPlayer() {
        const players = matchComService.getPlayers();
        for (const player of players) {
            matchComService.emitToPlayer(player.id, 'nextPlayer', {
                turn: matchService.getTurn(),
                currentPlayer: matchService.getCurrentPlayer()
            });
        }
    }
}

module.exports = PutDownCardController;
