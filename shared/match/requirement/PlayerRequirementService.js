const _canMill = require('../mill/canMill.js');
const Commander = require('../commander/Commander.js');

//TODO Separate querying for requirements and adding requirements
// A lot more information is required to add a requirement than to query once that are added.
// This leads to circular dependencies or to duplicated business logic, as objects needs this service to query
// and this service needs those objects to add requirements.
function PlayerRequirementService({
    playerStateService,
    opponentStateService,
    playerCommanders,
    moreCardsCanBeDrawnForDrawPhase,
    queryPlayerRequirements
}) {

    return {
        getFirstMatchingRequirement: queryPlayerRequirements.getFirstMatchingRequirement,
        firstRequirementIsOfType: queryPlayerRequirements.firstRequirementIsOfType,

        addCardRequirement,
        addDrawCardRequirement,
        addDiscardCardRequirement,
        addDamageStationCardRequirement,
        addFindCardRequirement,
        addCounterCardRequirement,
        addCounterAttackRequirement,

        canAddDiscardCardRequirementWithCountOrLess,
        getQueuedDamageStationCardCount,
        canMill,
        addEmptyCommonWaitingRequirement,

        updateFirstMatchingRequirement,
        removeFirstMatchingRequirement,
    };

    function all() {
        return playerStateService.getPlayerState()
            .requirements
            .slice();
    }

    function isWaitingOnOpponentFinishingRequirement() {
        return all().some(r => r.waiting);
    }

    function firstRequirementIsOfType(type) {
        const requirements = all();
        const firstRequirement = requirements[0];
        return firstRequirement && firstRequirement.type === type;
    }

    function addCardRequirement(requirement) {
        const type = requirement.type;
        if (type === 'drawCard') {
            return addDrawCardRequirement(requirement);
        }
        else if (type === 'discardCard') {
            return addDiscardCardRequirement(requirement);
        }
        else if (type === 'damageStationCard') {
            return addDamageStationCardRequirement(requirement);
        }
        else if (type === 'findCard') {
            return addFindCardRequirement(requirement);
        }
        else if (type === 'counterCard') {
            return addCounterCardRequirement(requirement);
        }
        else if (type === 'counterAttack') {
            return addCounterAttackRequirement(requirement);
        }
    }

    function addDiscardCardRequirement({ count, common = false, cardCommonId = null }) {
        const countToDiscard = getCountOrMinimumAvailableForDiscardingCards(count);
        if (countToDiscard > 0) {
            const requirement = {
                type: 'discardCard',
                count: countToDiscard
            };
            if (common) {
                requirement.common = true;
            }
            if (cardCommonId) {
                requirement.cardCommonId = cardCommonId;
            }
            addRequirement(requirement);

            return requirement;
        }

        return null;
    }

    function addDrawCardRequirement({ count, common = false, cardCommonId = null, whenResolvedAddAlso = [] }) {
        const countToDraw = getCountOrMinimumAvailableForDrawingCards(count);
        if (countToDraw > 0) {
            const requirement = { type: 'drawCard', count: countToDraw };
            if (common) {
                requirement.common = true;
            }
            if (cardCommonId) {
                requirement.cardCommonId = cardCommonId;
            }
            if (whenResolvedAddAlso.length) {
                requirement.whenResolvedAddAlso = whenResolvedAddAlso;
            }
            addRequirement(requirement);

            return requirement;
        }

        return null;
    }

    function addDamageStationCardRequirement({ count, common = false, cardCommonId = null, reason = '' }) {
        const stationCardCount = opponentStateService.getUnflippedStationCardsCount();

        const currentDamageStationCardRequirementsCount = all()
            .filter(r => r.type === 'damageStationCard')
            .reduce((total, requirement) => total + requirement.count, 0);

        const maxStationCardCount = stationCardCount - currentDamageStationCardRequirementsCount;
        const countToDraw = Math.min(maxStationCardCount, count);
        if (countToDraw > 0) {
            const requirement = { type: 'damageStationCard', count: countToDraw };
            if (reason) {
                requirement.reason = reason;
            }
            if (common) {
                requirement.common = true;
            }
            if (cardCommonId) {
                requirement.cardCommonId = cardCommonId;
            }
            addRequirement(requirement);

            return requirement;
        }

        return null;
    }

    function addFindCardRequirement({ count, cardGroups, ...uncheckedProperties }) {
        const totalCardCount = cardGroups.reduce((acc, group) => acc + group.cards.length, 0);
        const requirement = {
            ...uncheckedProperties,
            type: 'findCard',
            count: Math.min(totalCardCount, count),
            cardGroups: cardGroups.filter(g => g.cards.length)
        };
        addRequirement(requirement);

        return requirement;
    }

    function addCounterCardRequirement({ count, cardGroups, ...uncheckedProperties }) {
        const totalCardCount = cardGroups.reduce((acc, group) => acc + group.cards.length, 0);
        const requirement = {
            ...uncheckedProperties,
            type: 'counterCard',
            count: Math.min(totalCardCount, count),
            cardGroups: cardGroups.filter(g => g.cards.length)
        };
        addRequirement(requirement);

        return requirement;
    }

    function addCounterAttackRequirement({ count, attacks, ...uncheckedProperties }) {
        const requirement = {
            ...uncheckedProperties,
            type: 'counterAttack',
            count: Math.min(attacks.length, count),
            attacks
        };
        addRequirement(requirement);

        return requirement;
    }

    function canAddDiscardCardRequirementWithCountOrLess(count) {
        return getCountOrMinimumAvailableForDiscardingCards(count) > 0;
    }

    function getCountOrMinimumAvailableForDiscardingCards(maxCount) {
        const cardsOnHandCount = playerStateService.getCardsOnHandCount();

        const currentDiscardCardRequirementsCount =
            all()
                .filter(r => r.type === 'discardCard')
                .reduce((total, requirement) => total + requirement.count, 0);

        const maxDiscardCount = cardsOnHandCount - currentDiscardCardRequirementsCount;
        return Math.min(maxDiscardCount, maxCount);
    }

    function getQueuedDamageStationCardCount() {
        return all()
            .filter(r => r.type === 'damageStationCard')
            .reduce((total, requirement) => total + requirement.count, 0);
    }

    function getCountOrMinimumAvailableForDrawingCards(maxCount) {
        const deckCardCount = playerStateService.getDeck().getCardCount();
        const availableDrawsAndMills = deckCardCount + opponentDeckPossibleMillsCount();
        const maxDrawCount = availableDrawsAndMills - currentDrawCardRequirementsCount();
        return Math.min(maxDrawCount, maxCount);
    }

    function currentDrawCardRequirementsCount() {
        return all()
            .filter(r => r.type === 'drawCard')
            .reduce((total, requirement) => total + requirement.count, 0);
    }

    function opponentDeckPossibleMillsCount() {
        if (!canMill()) return 0;

        return opponentStateService.getDeck().getPossibleMillCount();
    }

    function canMill() {
        return _canMill({
            isWaitingOnOpponentFinishingRequirement: isWaitingOnOpponentFinishingRequirement(),
            firstRequirementIsDrawCard: firstRequirementIsOfType('drawCard'),
            opponentDeckIsEmpty: opponentStateService.deckIsEmpty(),
            playerHasTheMiller: playerCommanders.has(Commander.TheMiller),
            moreCardsCanBeDrawnForDrawPhase: moreCardsCanBeDrawnForDrawPhase()
        })
    }

    function addRequirement(requirement) {
        playerStateService.update(playerState => {
            playerState.requirements.push(requirement);
        });
    }

    function addEmptyCommonWaitingRequirement(requirement) {
        const addedRequirement = {
            ...requirement,
            count: 0,
            common: true,
            waiting: true
        };
        addRequirement(addedRequirement);

        return addedRequirement;
    }

    function updateFirstMatchingRequirement({ type, common = null, waiting = null }, updateFn) {
        playerStateService.update(playerState => {
            const requirements = playerState.requirements.slice();
            const requirement = findMatchingRequirement(
                requirements,
                { type, common, waiting }
            );
            return updateFn(requirement);
        });

        const updatedRequirements = all();
        return findMatchingRequirement(updatedRequirements, { type, common, waiting });
    }

    function removeFirstMatchingRequirement({ type, common = null, waiting = null }) {
        playerStateService
            .update(playerState => {
                const requirements = playerState.requirements.slice();
                const requirement = findMatchingRequirement(requirements, { type, common, waiting });
                const reverseIndexOfRequirement = requirements.indexOf(requirement);
                playerState.requirements.splice(reverseIndexOfRequirement, 1);
            });
    }

    function findMatchingRequirement(requirements, { type, common = null, waiting = null }) {
        return requirements.find(r => {
            return r.type === type
                && (common === null || r.common === common)
                && (waiting === null || r.waiting === waiting);
        });
    }
}

module.exports = PlayerRequirementService;
