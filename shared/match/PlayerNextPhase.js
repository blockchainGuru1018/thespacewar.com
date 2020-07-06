const { PHASES } = require('../phases.js');
const whatIsNextPhase = require('./whatIsNextPhase.js');
const Commander = require("./commander/Commander.js");
const CheatError = require('../../server/match/CheatError.js');

module.exports = function ({
    matchService,
    playerStateService,
    playerPhase,
    canThePlayer,
    playerCommanders,
    playerGameTimer,
    playerDiscardPhase,
    addRequirementFromSpec,
    opponentStateService
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
            playerDiscardPhase.leavePhase();
        }

        if (!playerPhase.isLastPhase()) {
            const nextPhase = getNextPhase();
            playerStateService.setPhase(nextPhase);

            if (playerPhase.isDraw()) {
                enterDrawPhaseForPlayer();
            }
        }
    }

    function getNextPhase() {
        return whatIsNextPhase({
            hasDurationCardInPlay: playerStateService.hasDurationCardInPlay(),
            currentPhase: playerStateService.getPhase()
        });
    }

    function enterDrawPhaseForPlayer() {
        if (playerStateService.deckIsEmpty() && !playerCommanders.has(Commander.NiciaSatu)) {
            penalizePlayerForEmptyDeck();
        }

        const specAndCardTuples = getRequirementsSpecAndCardTuplesFromDurationCards('requirementsWhenEnterDrawPhase');
        if (specAndCardTuples.length > 0) {
            for (const specAndCardTuple of specAndCardTuples) {
                addRequirementFromSpec.forCardAndSpec(specAndCardTuple.card, specAndCardTuple.requirementsSpec);
            }
        }
    }

    function penalizePlayerForEmptyDeck() {
        addRequirementFromSpec.forReasonAndSpec('emptyDeck', {
            forPlayer: [{
                type: 'damageStationCard',
                common: true,
                count: 0,
                waiting: true
            }],
            forOpponent: [{
                type: 'damageStationCard',
                common: true,
                count: 3
            }]
        });
    }

    function leaveDrawPhaseForPlayer() {
        const specAndCardTuples = [
            ...getRequirementsSpecAndCardTuplesFromDurationCards('requirementsWhenLeavingDrawPhase'),
            ...getRequirementsSpecAndCardTuplesFromOpponentCards('requirementsWhenOpponentLeaveDrawPhase')
        ];
        if (specAndCardTuples.length > 0) {
            for (const specAndCardTuple of specAndCardTuples) {
                addRequirementFromSpec.forCardAndSpec(specAndCardTuple.card, specAndCardTuple.requirementsSpec);
            }
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

        if (playerGameTimer.hasEnded() && matchService.gameIsHumanVsHuman()) {
            matchService.playerRetreat(getPlayerId());
        }
    }

    function isLastPlayerOfTurn() {
        return getPlayerId() === matchService.getLastPlayerId();
    }

    function getRequirementsSpecAndCardTuplesFromDurationCards(key) {
        return playerStateService
            .getDurationCards()
            .filter(cardData => canThePlayer.useThisDurationCard(cardData.id))
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .map(card => {
                return { card, requirementsSpec: card[key] }
            })
            .filter(({ requirementsSpec }) => !!requirementsSpec);
    }

    function getRequirementsSpecAndCardTuplesFromOpponentCards(key) {
        return opponentStateService
            .getMatchingBehaviourCards(withKey(key))
            .map(card => {
                return { card, requirementsSpec: card[key] }
            })
            .filter(tuple => !!tuple.requirementsSpec)
            .filter(soToKeepApplicableRequirements(playerStateService))
            .map(opponentRequirementToPlayerRequirement);
    }

    function hasNegativeActionPoints() {
        const actionPoints = playerStateService.getActionPointsForPlayer(getPlayerId());
        return actionPoints < 0;
    }

    function getPlayerId() {
        return playerStateService.getPlayerId();
    }
};

function opponentRequirementToPlayerRequirement({ card, requirementsSpec }) {
    return {
        card,
        requirementsSpec: {
            forPlayer: requirementsSpec.forOpponent,
            forOpponent: requirementsSpec.forPlayer
        }
    };
}

function soToKeepApplicableRequirements(opponentStateService) {
    return ({ requirementsSpec }) => !requirementsSpec.shouldApply || requirementsSpec.shouldApply({ opponentStateService });
}

function withKey(key) {
    return card => !!card[key]
}
