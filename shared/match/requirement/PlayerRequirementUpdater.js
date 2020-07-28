class PlayerRequirementUpdater {
  constructor({
    cardFactory,
    playerRequirementService,
    opponentRequirementService,
    requirementMatchConditions,
    addRequirementFromSpec,
  }) {
    this._requirementMatchCondition = requirementMatchConditions;

    this._playerRequirementService = playerRequirementService;
    this._opponentRequirementService = opponentRequirementService;
    this._addRequirementFromSpec = addRequirementFromSpec;
    this._cardFactory = cardFactory;
  }

  exists() {
    return !!this._get();
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
    if (requirement.actionPointsLimit) {
      const actionPointsLeft = requirement.actionPointsLimit.actionPointsLeft;
      for (let i = 0; i < actionPointsLeft; i++) {
        this.progressRequirementByActionPointsLeft(1, true);
      }
    }
    this._playerRequirementService.removeFirstMatchingRequirement({
      type: requirement.type,
    });
  }

  progressRequirementByCount(count = 1) {
    //TODO It is to unclear that this removes the requirement if has progressed the requirement so that it is "done"
    const requirement = this._get();
    if (requirement.count > count) {
      this._update((requirement) => {
        requirement.count -= count;
      });
    } else if (requirement.common) {
      if (this._opponentHasMatchingAndWaitingRequirement()) {
        this._removeOpponentMatchingAndWaitingRequirement();
        this.resolve();
      } else {
        this._update((requirement) => {
          requirement.count = 0;
          requirement.waiting = true;
        });
      }
    } else {
      this.resolve();
    }
  }
  progressRequirementByActionPointsLeft(
    actionPointsConsumed = 1,
    isCardGroupsEmpty
  ) {
    const requirement = this._get();
    if (requirement) {
      if (
        requirement.actionPointsLimit.actionPointsLeft >= actionPointsConsumed
      ) {
        this._update((requirement) => {
          requirement.actionPointsLimit.actionPointsLeft -= actionPointsConsumed;
          requirement.cardGroups[0].cards = requirement.cardGroups[0].cards.filter(
            (cardData) =>
              cardData.cost <= requirement.actionPointsLimit.actionPointsLeft
          );
          if (requirement.cardGroups[0].cards.length === 0) {
            this.completeRequirement();
          }
        });
      }
      if (
        requirement.actionPointsLimit.actionPointsLeft === 0 ||
        isCardGroupsEmpty
      ) {
        this.completeRequirement();
      }
    }
  }
  resolve() {
    const requirement = this._get();

    this._playerRequirementService.removeFirstMatchingRequirement(
      this._getMatchCondition()
    );

    if (requirement.whenResolvedAddAlso) {
      for (const spec of requirement.whenResolvedAddAlso) {
        const card = this._cardFactory.createCardForPlayer(
          spec._cardData,
          spec._playerId
        );
        this._addRequirementFromSpec.forCardAndSpec(card, spec);
      }
    }
  }

  _opponentHasMatchingAndWaitingRequirement() {
    const opponentWaitingRequirement = this._opponentRequirementService.getFirstMatchingRequirement(
      {
        ...this._getMatchCondition(),
        waiting: true,
      }
    );
    return !!opponentWaitingRequirement;
  }

  _removeOpponentMatchingAndWaitingRequirement() {
    this._opponentRequirementService.removeFirstMatchingRequirement({
      ...this._getMatchCondition(),
      common: true,
      waiting: true,
    });
  }

  _get() {
    return this._playerRequirementService.getFirstMatchingRequirement(
      this._getMatchCondition()
    );
  }

  _update(updateFn) {
    this._playerRequirementService.updateFirstMatchingRequirement(
      this._getMatchCondition(),
      updateFn
    );
  }

  _getMatchCondition() {
    const condition = { ...this._requirementMatchCondition };
    if (!condition.type) {
      condition.type = null;
    }
    return condition;
  }
}

module.exports = PlayerRequirementUpdater;
