class PlayerRequirementService { //TODO Rename PlayerRequirements

    constructor({
        playerStateService
    }) {
        this._playerStateService = playerStateService;
    }

    getRequirements() {
        return this._playerStateService
            .getPlayerState()
            .requirements
            .slice();
    }

    getFirstMatchingRequirement({ type, common = null, waiting = null }) {
        const requirements = this._playerStateService
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
        else if (type === 'damageOwnStationCard') {
            this.addDamageOwnStationCardRequirement({ count, common, cardCommonId });
        }
    }

    addDiscardCardRequirement({ count, common = false, cardCommonId = null }) {
        const cardsOnHandCount = this._playerStateService.getCardsOnHandCount();

        const currentDiscardCardRequirementsCount = this.getRequirements()
            .filter(r => r.type === 'discardCard')
            .reduce((total, requirement) => total + requirement.count, 0);

        const maxDiscardCount = cardsOnHandCount - currentDiscardCardRequirementsCount;
        const countToDiscard = Math.min(maxDiscardCount, count);
        if (countToDiscard > 0) {
            const requirement = { type: 'discardCard', count: countToDiscard };
            if (common) {
                requirement.common = true;
            }
            if (cardCommonId) {
                requirement.cardCommonId = cardCommonId;
            }
            this.addRequirement(requirement);
        }
    }

    addDrawCardRequirement({ count, common = false, cardCommonId = null }) {
        const deckCardCount = this._playerStateService.getDeck().getCardCount();

        const currentDrawCardRequirementsCount = this.getRequirements()
            .filter(r => r.type === 'drawCard')
            .reduce((total, requirement) => total + requirement.count, 0);

        const maxDrawCount = deckCardCount - currentDrawCardRequirementsCount;
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

    addDamageOwnStationCardRequirement({ count, common = false, cardCommonId = null }) {
        const stationCardCount = this._playerStateService.getUnflippedStationCardsCount();

        const currentDrawCardRequirementsCount = this.getRequirements()
            .filter(r => r.type === 'damageOwnStationCard')
            .reduce((total, requirement) => total + requirement.count, 0);

        const maxStationCardCount = stationCardCount - currentDrawCardRequirementsCount;
        const countToDraw = Math.min(maxStationCardCount, count);
        if (countToDraw > 0) {
            const requirement = { type: 'damageOwnStationCard', count: countToDraw };
            if (common) {
                requirement.common = true;
            }
            if (cardCommonId) {
                requirement.cardCommonId = cardCommonId;
            }
            this.addRequirement(requirement);
        }
    }

    addRequirement(requirement) { //TODO Find a better name to differentiate this from addCardRequirement (or perhaps addCardRequirement should be somewhere else?)
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