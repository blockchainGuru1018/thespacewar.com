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
        const availableCount = Math.min(cardsOnHandCount, count);
        if (availableCount > 0) {
            const requirement = { type: 'discardCard', count: availableCount };
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
        const availableCount = Math.min(deckCardCount, count);
        if (availableCount > 0) {
            const requirement = { type: 'drawCard', count: availableCount };
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
        const availableCount = Math.min(stationCardCount, count);
        if (availableCount > 0) {
            const requirement = { type: 'damageOwnStationCard', count: availableCount };
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