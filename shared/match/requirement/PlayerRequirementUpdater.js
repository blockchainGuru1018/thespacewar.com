class PlayerRequirementUpdater { //TODO Rename PlayerRequirements

    constructor({
        playerStateService,
        playerRequirementService,
        opponentRequirementService,
        requirementMatchConditions
    }) {
        this._requirementMatchCondition = requirementMatchConditions;

        this._playerStateService = playerStateService;
        this._playerRequirementService = playerRequirementService;
        this._opponentRequirementService = opponentRequirementService;
    }

    canProgressRequirementByCount(count) {
        const requirement = this._get();
        return requirement && count <= requirement.count;
    }

    progressRequirementByCount(count = 1) { //TODO It is to unclear that this removes the requirement if has progressed the requirement so that it is "done"
        const requirement = this._get();
        if (requirement.count > count) {
            this._update(requirement => {
                requirement.count -= count;
            });
        }
        else if (requirement.common) {
            if (this._opponentHasMatchingAndWaitingRequirement()) {
                this._removeOpponentMatchingAndWaitingRequirement();
                this._remove();
            }
            else {
                this._update(requirement => {
                    requirement.count = 0;
                    requirement.waiting = true;
                });
            }
        }
        else {
            this._remove();
        }
    }

    _opponentHasMatchingAndWaitingRequirement() {
        const opponentWaitingRequirement = this._opponentRequirementService.getFirstMatchingRequirement({
            ...this._requirementMatchCondition,
            waiting: true
        });
        return !!opponentWaitingRequirement;
    }

    _removeOpponentMatchingAndWaitingRequirement() {
        this._opponentRequirementService.removeFirstMatchingRequirement({
            ...this._requirementMatchCondition,
            common: true,
            waiting: true
        });
    }

    _get() {
        return this._playerRequirementService.getFirstMatchingRequirement(this._requirementMatchCondition);
    }

    _update(updateFn) {
        this._playerRequirementService.updateFirstMatchingRequirement(this._requirementMatchCondition, updateFn);
    }

    _remove() {
        return this._playerRequirementService.removeFirstMatchingRequirement(this._requirementMatchCondition)
    }

}

module.exports = PlayerRequirementUpdater;
