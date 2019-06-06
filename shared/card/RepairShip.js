const phases = require('../phases.js');
const BaseCard = require('./BaseCard.js');

module.exports = class RepairShip extends BaseCard {
    constructor({ repairCapability, ...deps }) {
        super(deps);

        this._matchService = deps.matchService;
        this._repairCapability = repairCapability;
    }

    canAttack() {
        return super.canAttack() && !this._hasRepairedThisTurn();
    }

    canRepair() {
        if (this.paralyzed) return false;
        if (this._playerStateService.getPhase() !== phases.PHASES.attack) return false;
        if (this._hasRepairedThisTurn()) return false;
        if (this._hasAttackedThisTurn()) return false;

        return this._hasCardInSameZoneThatCanBeRepaired()
            || this._canRepairFlippedStationCards();
    }

    canRepairCard(card) {
        if (!card.canBeRepaired()) return false;

        return card.isStationCard()
            || card.isInHomeZone() === this.isInHomeZone();
    }

    repairCard(otherCardOrStationCard) {
        if (otherCardOrStationCard.flipped) {
            otherCardOrStationCard.flipped = false;
        }
        else {
            this._repairZoneCard(otherCardOrStationCard);
        }
    }

    _repairZoneCard(otherCard) {
        const {
            paralyzed,
            damage
        } = this.simulateRepairingCard(otherCard);

        otherCard.paralyzed = paralyzed;
        otherCard.damage = damage;
    }

    simulateRepairingCard(otherCard) {
        return {
            paralyzed: false,
            damage: otherCard.paralyzed ? otherCard.damage : Math.max(0, otherCard.damage - this._repairCapability)
        };
    }

    _hasRepairedThisTurn() {
        const currentTurn = this._matchService.getTurn();
        let repairsThisTurn = this._queryEvents.getRepairsOnTurn(this.id, currentTurn);
        return repairsThisTurn.length > 0;
    }

    _hasAttackedThisTurn() {
        const turn = this._matchService.getTurn();
        const attacksOnTurn = this._queryEvents.getAttacksOnTurn(this.id, turn).length;
        return attacksOnTurn > 0;
    }

    _hasCardInSameZoneThatCanBeRepaired() {
        return this._playerStateService.hasMatchingCardInSameZone(this.id, card => {
            return card.canBeRepaired()
        });
    }

    _canRepairFlippedStationCards() {
        return this._playerStateService.hasFlippedStationCards()
            && this._playerStateService.isCardInHomeZone(this.id);
    }
};
