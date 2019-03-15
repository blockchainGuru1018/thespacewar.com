class PlayerRequirementService { //TODO Rename PlayerRequirements

    constructor({
        playerStateService,
        opponentStateService
    }) {
        this._playerStateService = playerStateService;
        this._opponentStateService = opponentStateService;
    }

    getRequirements() {
        return this._playerStateService
            .getPlayerState()
            .requirements
            .slice();
    }

    getFirstMatchingRequirement({ type, common = null, waiting = null }) {
        const requirements = this
            ._playerStateService
            .getPlayerState()
            .requirements
            .slice();
        return this._findMatchingRequirement(requirements, { type, common, waiting });
    }

    addCardRequirement({ type, count, common = false, cardCommonId = null }) {
        if (type === 'drawCard') {
            this.addDrawCardRequirement({ count, common, cardCommonId });
        }
        else if (type === 'discardCard') {
            this.addDiscardCardRequirement({ count, common, cardCommonId });
        }
        else if (type === 'damageStationCard') {
            this.addDamageStationCardRequirement({ count, common, cardCommonId });
        }
    }

    addDiscardCardRequirement({ count, common = false, cardCommonId = null }) {
        if (this.canAddDiscardCardRequirementWithCountOrLess(count)) {
            const requirement = {
                type: 'discardCard',
                count: this.getCountOrMinimumAvailableForDiscardingCards(count)
            };
            if (common) {
                requirement.common = true;
            }
            if (cardCommonId) {
                requirement.cardCommonId = cardCommonId;
            }
            this.addRequirement(requirement);
        }
    }

    canAddDiscardCardRequirementWithCountOrLess(count) {
        return this.getCountOrMinimumAvailableForDiscardingCards(count) > 0;
    }

    getCountOrMinimumAvailableForDiscardingCards(maxCount) {
        const cardsOnHandCount = this._playerStateService.getCardsOnHandCount();

        const currentDiscardCardRequirementsCount = this
            .getRequirements()
            .filter(r => r.type === 'discardCard')
            .reduce((total, requirement) => total + requirement.count, 0);

        const maxDiscardCount = cardsOnHandCount - currentDiscardCardRequirementsCount;
        return Math.min(maxDiscardCount, maxCount);
    }

    addDrawCardRequirement({ count, common = false, cardCommonId = null }) {
        const deckCardCount = this._playerStateService.getDeck().getCardCount();
        const opponentDeckPossibleMillsCount = this._opponentStateService.getDeck().getPossibleMillCount();

        const currentDrawCardRequirementsCount = this
            .getRequirements()
            .filter(r => r.type === 'drawCard')
            .reduce((total, requirement) => total + requirement.count, 0);

        const maxDrawCount = (deckCardCount + opponentDeckPossibleMillsCount) - currentDrawCardRequirementsCount;
        const countToDraw = Math.min(maxDrawCount, count);
        if (countToDraw > 0) {
            const requirement = { type: 'drawCard', count: countToDraw };
            if (common) {
                requirement.common = true;
            }
            if (cardCommonId) {
                requirement.cardCommonId = cardCommonId;
            }
            this.addRequirement(requirement);
        }
    }

    addDamageStationCardRequirement({ count, common = false, cardCommonId = null }) {
        const stationCardCount = this._opponentStateService.getUnflippedStationCardsCount();

        const currentDrawCardRequirementsCount = this
            .getRequirements()
            .filter(r => r.type === 'damageStationCard')
            .reduce((total, requirement) => total + requirement.count, 0);

        const maxStationCardCount = stationCardCount - currentDrawCardRequirementsCount;
        const countToDraw = Math.min(maxStationCardCount, count);
        if (countToDraw > 0) {
            const requirement = { type: 'damageStationCard', count: countToDraw };
            if (common) {
                requirement.common = true;
            }
            if (cardCommonId) {
                requirement.cardCommonId = cardCommonId;
            }
            this.addRequirement(requirement);
        }
    }

    addRequirement(requirement) { //TODO Find a better name to differentiate this from addCardRequirement
        this._playerStateService.update(playerState => {
            playerState.requirements.push(requirement);
        });
    }

    updateFirstMatchingRequirement({ type, common = null, waiting = null }, updateFn) {
        const updatedState = this._playerStateService.update(playerState => {
            const requirements = playerState.requirements.slice();
            const requirement = this._findMatchingRequirement(
                requirements,
                { type, common, waiting }
            );
            updateFn(requirement);
        });

        const requirements = updatedState.requirements.slice();
        return this._findMatchingRequirement(requirements, { type, common, waiting });
    }

    removeFirstMatchingRequirement({ type, common = null, waiting = null }) {
        this._playerStateService
            .update(playerState => {
                const requirements = playerState.requirements.slice();
                const requirement = this._findMatchingRequirement(requirements, { type, common, waiting });
                const reverseIndexOfRequirement = requirements.indexOf(requirement);
                playerState.requirements.splice(reverseIndexOfRequirement, 1);
            });
    }

    _findMatchingRequirement(requirements, { type, common = null, waiting = null }) {
        return requirements.find(r => {
            return r.type === type
                && (common === null || r.common === common)
                && (waiting === null || r.waiting === waiting);
        });
    }
}

module.exports = PlayerRequirementService;