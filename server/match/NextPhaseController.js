const CheatError = require('./CheatError.js');
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

        const playerPhase = playerStateService.getPhase();
        if (playerPhase === PHASES.draw) {
            leaveDrawPhaseForPlayer(playerId);
        }
        else if (playerPhase === PHASES.discard) {
            leaveDiscardPhaseForPlayer(playerId);
        }

        const isLastPhase = playerStateService.getPhase() === PHASES.attack;
        if (isLastPhase) {
            endTurnForCurrentPlayer();
        }
        else {
            const nextPhase = getNextPhase(playerStateService.getPhase());
            playerStateService.setPhase(nextPhase);
        }

        const newPhase = playerStateService.getPhase();
        if (newPhase === PHASES.draw) {
            enterDrawPhaseForPlayer(playerId);
        }
    }

    function getNextPhase(currentPhase) {
        return COMMON_PHASE_ORDER[(COMMON_PHASE_ORDER.indexOf(currentPhase) + 1)];
    }

    function enterDrawPhaseForPlayer(playerId) {
        const requirementLists = getRequirementsFromDurationCards(playerId, 'requirementsWhenEnterDrawPhase');
        if (requirementLists.length > 0) {
            requirementLists.forEach(requirements => addCardRequirements({ playerId, requirements }));
            emitStateChangedWithRequirementsToPlayer(playerId);
        }
    }

    //TODO Should not run duration card code when CANNOT run it by "CanThePlayer.useDurationCard(cardId)"
    // find a smooth way to check for permission without to much copy & poaste
    function leaveDrawPhaseForPlayer(playerId) {
        const requirementLists = getRequirementsFromDurationCards(playerId, 'requirementsWhenLeavingDrawPhase');
        if (requirementLists.length > 0) {
            requirementLists.forEach(requirements => addCardRequirements({ playerId, requirements }));
            emitStateChangedWithRequirementsToPlayer(playerId);
        }
    }

    function getRequirementsFromDurationCards(playerId, key) {
        return playerServiceProvider
            .getStateServiceById(playerId)
            .getDurationCards()
            .map(cardData => cardFactory.createCardForPlayer(cardData, playerId))
            .map(card => card[key])
            .filter(requirements => !!requirements);
    }

    function addCardRequirements({ playerId, requirements }) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        for (const requirement of requirements.forPlayer) {
            playerRequirementService.addCardRequirement(requirement);
        }

        const opponentId = matchComService.getOpponentId(playerId);
        const opponentRequirementService = playerServiceProvider.getRequirementServiceById(opponentId);
        for (const requirement of requirements.forOpponent) {
            opponentRequirementService.addCardRequirement(requirement);
        }
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
        const hasDurationCardInPlay = currentPlayerStateService.getDurationCards().length;
        const nextPhase = hasDurationCardInPlay ? PHASES.preparation : PHASES.draw;
        currentPlayerStateService.setPhase(nextPhase);

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

    function emitStateChangedWithRequirementsToPlayer(playerId) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        matchComService.emitToPlayer(playerId, 'stateChanged', {
            requirements: playerRequirementService.getRequirements()
        });
    }
}

module.exports = PutDownCardController;
