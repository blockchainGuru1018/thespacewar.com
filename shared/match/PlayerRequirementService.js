class PlayerRequirementService {

    constructor(deps) {
        this._playerStateService = deps.playerStateService;
    }

    addRequirement(requirement) {
        this._playerStateService.update(playerState => {
            playerState.requirements.push(requirement);
        });
    }

    getRequirements() {
        return this._playerStateService
            .getPlayerState()
            .requirements;
    }

    getLatestMatchingRequirement({ type, common = null, waiting = null }) {
        const requirements = this._playerStateService
            .getPlayerState()
            .requirements
            .slice()
            .reverse()
        return this._findMatchingRequirement(requirements, { type, common, waiting });
    }

    decrementCountOnLatestMatchingRequirement({ type, common = null, waiting = null }) {
        const requirement = this.getLatestMatchingRequirement({ type, common, waiting });
        if (requirement.count === 1) {
            this.removeLatestMatchingRequirement({ type, common, waiting });
        }
        else {
            this.updateLatestMatchingRequirement({ type, common, waiting }, requirement => {
                requirement.count -= 1;
            });
        }
    }

    mergeLatestMatchingRequirement({ type, common = null, waiting = null }, mergeData) {
        this._playerStateService
            .update(playerState => {
                const requirements = playerState.requirements.slice().reverse();
                const requirement = this._findMatchingRequirement(requirements, { type, common, waiting });
                Object.assign(requirement, mergeData);
            });
    }

    updateLatestMatchingRequirement({ type, common = null, waiting = null }, updateFn) {
        const updatedState = this._playerStateService
            .update(playerState => {
                const requirements = playerState.requirements.slice().reverse();
                const requirement = this._findMatchingRequirement(requirements, { type, common, waiting });
                updateFn(requirement);
            });

        const requirements = updatedState.requirements.slice().reverse();
        return this._findMatchingRequirement(requirements, { type, common, waiting });
    }

    removeLatestMatchingRequirement({ type, common = null, waiting = null }) {
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