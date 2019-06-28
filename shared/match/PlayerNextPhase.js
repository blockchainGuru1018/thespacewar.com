const { PHASES } = require('../phases.js');
const whatIsNextPhase = require('./whatIsNextPhase.js');
const Commander = require("./commander/Commander.js");
const CheatError = require('../../server/match/CheatError.js');

module.exports = function ({
    matchService,
    playerRuleService,
    playerStateService,
    playerRequirementService,
    playerPhase,
    canThePlayer,
    playerCommanders,
    playerGameTimer, //TODO Should it locally be called "gameTimer" or like here "playerGameTimer"
    opponentStateService,
    opponentRequirementService,
}) {

    return {
        validateCanGoToNextPhase,
        next,
        canEndTurnForPlayer,
        endTurnForPlayer
    };

    function validateCanGoToNextPhase() {
        if (playerPhase.isPreparation() && hasNegativeActionPoints()) {
            throw new CheatError('Cannot go to next phase with less than 0 action points');
        }
    }

    function next() {
        if (playerPhase.isDraw()) {
            leaveDrawPhaseForPlayer();
        }
        else if (playerPhase.isDiscard()) {
            leaveDiscardPhaseForPlayer();
        }

        if (!playerPhase.isLastPhase()) {
            const nextPhase = whatIsNextPhase({
                hasDurationCardInPlay: playerStateService.hasDurationCardInPlay(),
                currentPhase: playerStateService.getPhase()
            });
            playerStateService.setPhase(nextPhase);

            if (playerPhase.isDraw()) {
                enterDrawPhaseForPlayer();
            }

            if (playerPhase.isFirstPhase()) {
                playerGameTimer.switchTo();
            }
        }
    }

    function enterDrawPhaseForPlayer() {
        if (playerStateService.deckIsEmpty() && !playerCommanders.has(Commander.NiciaSatu)) {
            penalizePlayerForEmptyDeck();
        }

        const requirementsFromDurationCards = getRequirementsFromDurationCards('requirementsWhenEnterDrawPhase');
        if (requirementsFromDurationCards.length > 0) {
            const playerId = getPlayerId();
            requirementsFromDurationCards.forEach(requirements => addCardRequirements({ playerId, requirements }));
        }
    }

    function penalizePlayerForEmptyDeck() {
        playerRequirementService.addRequirement({
            type: 'damageStationCard',
            common: true,
            count: 0,
            waiting: true,
            reason: 'emptyDeck'
        });

        opponentRequirementService.addDamageStationCardRequirement({
            common: true,
            count: 3,
            reason: 'emptyDeck'
        });
    }

    function leaveDrawPhaseForPlayer() {
        const requirementLists = [
            ...getRequirementsFromDurationCards('requirementsWhenLeavingDrawPhase'),
            ...getRequirementsFromOpponentCards('requirementsWhenOpponentLeaveDrawPhase')
        ];
        if (requirementLists.length > 0) {
            requirementLists.forEach(requirements => addCardRequirements({ requirements }));
        }
    }

    function leaveDiscardPhaseForPlayer() {
        const maxHandSize = playerRuleService.getMaximumHandSize();
        if (playerStateService.getCardsOnHandCount() > maxHandSize) {
            throw new CheatError('Cannot leave the discard phase without discarding enough cards'); //TODO SHOULD NOT THROW HERE?! Should check before executing code if its possible to do this.
        }
    }

    function canEndTurnForPlayer() {
        return playerPhase.isLastPhase();
    }

    function endTurnForPlayer() {
        playerPhase.set(PHASES.wait);

        if (isLastPlayerOfTurn()) {
            matchService.goToNextTurn();
        }
        else {
            matchService.goToNextPlayer();
        }
    }

    function isLastPlayerOfTurn() {
        return getPlayerId() === matchService.getLastPlayerId();
    }

    function getRequirementsFromDurationCards(key) {
        return playerStateService
            .getDurationCards()
            .filter(cardData => canThePlayer.useThisDurationCard(cardData.id))
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .map(card => card[key])
            .filter(requirements => !!requirements);
    }

    function getRequirementsFromOpponentCards(key) {
        return opponentStateService
            .getMatchingBehaviourCards(withKey(key))
            .map(card => card[key])
            .filter(soToKeepValuesThatAreNotNull)
            .filter(soToKeepApplicableRequirements(playerStateService))
            .map(opponentRequirementToPlayerRequirement);
    }

    function addCardRequirements({ requirements }) {
        for (const requirement of requirements.forPlayer) {
            playerRequirementService.addCardRequirement(requirement);
        }

        for (const requirement of requirements.forOpponent) {
            opponentRequirementService.addCardRequirement(requirement);
        }
    }

    function hasNegativeActionPoints() {
        const actionPoints = playerStateService.getActionPointsForPlayer(getPlayerId());
        return actionPoints < 0;
    }

    function getPlayerId() {
        return playerStateService.getPlayerId();
    }
};

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
