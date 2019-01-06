class PlayerRequirementService { //TODO Rename PlayerRequirements

    constructor(deps) {
        this._playerStateService = deps.playerStateService;
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
            .slice()
            .reverse()
        return this._findMatchingRequirement(requirements, { type, common, waiting });
    }

    addCardRequirement({ type, count, common = false }) {
        if (type === 'drawCard') {
            this.addDrawCardRequirement({ count, common });
        }
        else if (type === 'discardCard') {
            this.addDiscardCardRequirement({ count, common });
        }
        else if (type === 'damageOwnStationCard') {
            this.addDamageOwnStationCardRequirement({ count, common });
        }
    }

    addDiscardCardRequirement({ count, common = false }) {
        const cardsOnHandCount = this._playerStateService.getCardsOnHandCount();
        const availableCount = Math.min(cardsOnHandCount, count);
        if (availableCount > 0) {
            const requirement = { type: 'discardCard', count: availableCount };
            if (common) {
                requirement.common = true;
            }
            this.addRequirement(requirement);
        }
    }

    addDrawCardRequirement({ count, common = false }) {
        const deckCardCount = this._playerStateService.getDeck().getCardCount();
        const availableCount = Math.min(deckCardCount, count);
        if (availableCount > 0) {
            const requirement = { type: 'drawCard', count: availableCount };
            if (common) {
                requirement.common = true;
            }
            this.addRequirement(requirement);
        }
    }

    addDamageOwnStationCardRequirement({ count, common = false }) {
        const stationCardCount = this._playerStateService.getUnflippedStationCardsCount();
        const availableCount = Math.min(stationCardCount, count);
        if (availableCount > 0) {
            const requirement = { type: 'damageOwnStationCard', count: availableCount };
            if (common) {
                requirement.common = true;
            }
            this.addRequirement(requirement);
        }
    }

    addRequirement(requirement) {
        this._playerStateService.update(playerState => {
            playerState.requirements.push(requirement);
        });
    }

    updateFirstMatchingRequirement({ type, common = null, waiting = null }, updateFn) {
        const updatedState = this._playerStateService
            .update(playerState => {
                const requirements = playerState.requirements.slice().reverse();
                const requirement = this._findMatchingRequirement(requirements, { type, common, waiting });
                updateFn(requirement);
            });

        const requirements = updatedState.requirements.slice().reverse();
        return this._findMatchingRequirement(requirements, { type, common, waiting });
    }

    removeFirstMatchingRequirement({ type, common = null, waiting = null }) {
        this._playerStateService
            .update(playerState => {
                const requirements = playerState.requirements.slice().reverse();
                const requirement = this._findMatchingRequirement(requirements, { type, common, waiting });
                const reverseIndexOfRequirement = requirements.indexOf(requirement) + 1;
                playerState.requirements.splice(-reverseIndexOfRequirement, 1);
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