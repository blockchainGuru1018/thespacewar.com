const BaseCard = require('./BaseCard.js');
const DiscardCardEvent = require('../event/DiscardCardEvent.js');
const AttackEvent = require('../event/AttackEvent.js');

module.exports = class EnergyShield extends BaseCard {

    constructor(deps) {
        super(deps);

        this._playerId = deps.playerId;
        this._matchService = deps.matchService;
    }

    hasEffectOnStationAttack() {
        return true;
    }

    getImportanceOnStationAttack() {
        return 1;
    }

    stopsStationAttack() {
        return true;
    }

    applyEffectOnStationAttack({ attackerCard, targetStationCardIds }) {
        attackerCard.attackCard(this);

        const playerId = this._playerId;
        const playerState = this._matchService.getPlayerState(playerId);
        const state = this._matchService.getState();

        if (this.destroyed) {
            const cardIndex = playerState.cardsInZone.findIndex(c => c.id === this.id);
            const [cardData] = playerState.cardsInZone.splice(cardIndex, 1);
            playerState.discardedCards.push(cardData);
            this._matchService.storeEvent(playerId, DiscardCardEvent({ //TODO Will this result in more action points..? Or should this event be a "CardDestroyedEvent"?
                turn: state.turn,
                phase: playerState.phase,
                cardId: this.id,
                cardCommonId: this.commonId
            }));
        }
        else {
            this._matchService.updatePlayerCard(playerId, this.id, card => {
                card.damage = this.damage;
            });
        }

        let affectedItems = new Set(['cardsInZone']);
        if (this.destroyed) {
            affectedItems.add('discardedCards');
            affectedItems.add('events');
        }

        return { targetStationCardIds: [], affectedItems }
    }
}