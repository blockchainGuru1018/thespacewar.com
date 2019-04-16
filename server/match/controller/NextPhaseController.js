const CheatError = require('../CheatError.js');
const { COMMON_PHASE_ORDER, PHASES } = require('../../../shared/phases.js');

function PutDownCardController(deps) {

    const {
        matchService,
        matchComService,
        cardFactory,
        playerServiceProvider,
    } = deps;

    return {
        onNextPhase
    };

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

        const currentPlayerId = matchService.getCurrentPlayer();
        const currentPlayerStateService = playerServiceProvider.getStateServiceById(currentPlayerId);
        const newPhase = currentPlayerStateService.getPhase();
        if (newPhase === PHASES.draw) {
            enterDrawPhaseForPlayer(currentPlayerId);
        }
    }

    function getNextPhase(currentPhase) {
        return COMMON_PHASE_ORDER[(COMMON_PHASE_ORDER.indexOf(currentPhase) + 1)];
    }

    function enterDrawPhaseForPlayer(playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        if (playerStateService.deckIsEmpty()) {
            const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
            playerRequirementService.addRequirement({
                type: 'damageStationCard',
                common: true,
                count: 0,
                waiting: true,
                reason: 'emptyDeck'
            });

            const opponentId = matchService.getOpponentId(playerId);
            const opponentRequirementService = playerServiceProvider.getRequirementServiceById(opponentId);
            opponentRequirementService.addDamageStationCardRequirement({
                common: true,
                count: 3,
                reason: 'emptyDeck'
            });
        }

        const requirementsFromDurationCards = getRequirementsFromDurationCards(playerId, 'requirementsWhenEnterDrawPhase');
        if (requirementsFromDurationCards.length > 0) {
            requirementsFromDurationCards.forEach(requirements => addCardRequirements({ playerId, requirements }));
        }
    }

    function leaveDrawPhaseForPlayer(playerId) {
        const requirementLists = [
            ...getRequirementsFromDurationCards(playerId, 'requirementsWhenLeavingDrawPhase'),
            ...getRequirementsFromOpponentCards(playerId, 'requirementsWhenOpponentLeaveDrawPhase')
        ];
        if (requirementLists.length > 0) {
            requirementLists.forEach(requirements => addCardRequirements({ playerId, requirements }));
        }
    }

    function getRequirementsFromDurationCards(playerId, key) {
        const canThePlayer = playerServiceProvider.getCanThePlayerServiceById(playerId);
        return playerServiceProvider
            .getStateServiceById(playerId)
            .getDurationCards()
            .filter(cardData => canThePlayer.useThisDurationCard(cardData.id))
            .map(cardData => cardFactory.createCardForPlayer(cardData, playerId))
            .map(card => card[key])
            .filter(requirements => !!requirements);
    }

    function getRequirementsFromOpponentCards(playerId, key) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const opponentId = matchService.getOpponentId(playerId);
        return playerServiceProvider
            .getStateServiceById(opponentId)
            .getMatchingBehaviourCards(withKey(key))
            .map(card => card[key])
            .filter(soToKeepValuesThatAreNotNull)
            .filter(soToKeepApplicableRequirements(playerStateService))
            .map(opponentRequirementToPlayerRequirement);
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
        const playerRuleService = playerServiceProvider.getRuleServiceById(playerId);
        const maxHandSize = playerRuleService.getMaximumHandSize();
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

function opponentRequirementToPlayerRequirement(requirement) {
    return {
        forPlayer: requirement.forOpponent,
        forOpponent: requirement.forPlayer
    };
}

function soToKeepApplicableRequirements(opponentStateService) {
    return requirement => !requirement.shouldApply || requirement.shouldApply({ opponentStateService });
}

function soToKeepValuesThatAreNotNull(v) {
    return !!v;
}

function withKey(key) {
    return card => !!card[key]
}

module.exports = PutDownCardController;
