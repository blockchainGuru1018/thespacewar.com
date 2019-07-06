class PlayerRequirementUpdater { //TODO Rename PlayerRequirements

    constructor({
        cardFactory,
        playerRequirementService,
        opponentRequirementService,
        requirementMatchConditions,
        addRequirementFromSpec
    }) {
        this._requirementMatchCondition = requirementMatchConditions;

        this._playerRequirementService = playerRequirementService;
        this._opponentRequirementService = opponentRequirementService;
        this._addRequirementFromSpec = addRequirementFromSpec;
        this._cardFactory = cardFactory;
    }

    canProgressRequirementByCount(count) {
        const requirement = this._get();
        return requirement && count <= requirement.count;
    }

    completeRequirement() {
        const requirement = this._get();
        const count = requirement.count;
        for (let i = 0; i < count; i++) {
            this.progressRequirementByCount();
        }
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
                this.resolve();
            }
            else {
                this._update(requirement => {
                    requirement.count = 0;
                    requirement.waiting = true;
                });
            }
        }
        else {
            this.resolve();
        }
    }

    resolve() {
        const requirement = this._get();

        this._playerRequirementService.removeFirstMatchingRequirement(this._requirementMatchCondition);

        if (requirement.whenResolvedAddAlso) {
            for (const spec of requirement.whenResolvedAddAlso) {
                const card = this._cardFactory.createCardForPlayer(spec._cardData, spec._playerId);
                this._addRequirementFromSpec.forCardAndSpec(card, spec);
            }
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

}

module.exports = PlayerRequirementUpdater;
