const itemNamesForOpponentByItemNameForPlayer = require('./itemNamesForOpponentByItemNameForPlayer.js');
const CheatError = require('./CheatError.js');
const { PHASES } = require('../../shared/phases.js');

function AttackController(deps) {

    const {
        matchService,
        matchComService,
        playerStateServiceById,
        cardFactory
    } = deps;

    return {
        onAttack,
        onAttackStationCards
    }

    function onAttack(playerId, { attackerCardId, defenderCardId }) {
        const playerStateService = playerStateServiceById[playerId];
        const playerPhase = playerStateService.getPhase();
        if (playerPhase !== PHASES.attack) throw new CheatError('Cannot attack when not in attack phase');

        const attackerCardData = playerStateService.findCard(attackerCardId);

        const attackerCard = cardFactory.createCardForPlayer(attackerCardData, playerId);
        if (!attackerCard.canAttack()) throw new CheatError('Cannot attack with card');

        const opponentId = matchComService.getOpponentId(playerId);
        const opponentStateService = playerStateServiceById[opponentId];
        const defenderCardData = opponentStateService.findCard(defenderCardId);
        const defenderCard = cardFactory.createCardForPlayer(defenderCardData, opponentId);
        if (!attackerCard.canAttackCard(defenderCard)) throw new CheatError('Cannot attack that card');
        if (defenderCard.isInOpponentZone() === attackerCard.isInOpponentZone()) {
            throw new CheatError('Cannot attack card in another zone');
        }

        attackerCard.attackCard(defenderCard);

        matchComService.emitToPlayer(opponentId, 'opponentAttackedCard', {
            attackerCardId,
            defenderCardId,
            newDamage: defenderCard.damage,
            defenderCardWasDestroyed: defenderCard.destroyed,
            attackerCardWasDestroyed: attackerCard.destroyed
        });
        playerStateService.registerAttack(attackerCardId);

        const opponentStateChangedEvent = {}
        const playerStateChangedEvent = {};
        if (defenderCard.destroyed) {
            opponentStateService.removeCard(defenderCardId);
            opponentStateService.discardCard(defenderCardData);

            const opponentDiscardedCards = opponentStateService.getDiscardedCards();
            opponentStateChangedEvent.discardedCards = opponentDiscardedCards;
            opponentStateChangedEvent.events = opponentStateService.getEvents();
            playerStateChangedEvent[itemNamesForOpponentByItemNameForPlayer.discardedCards] = opponentDiscardedCards;
        }
        else {
            opponentStateService.updateCard(defenderCardId, card => {
                card.damage = defenderCard.damage;
            });
        }

        if (attackerCard.destroyed) {
            playerStateService.removeCard(attackerCardId);
            playerStateService.discardCard(attackerCardData);

            let discardedCards = playerStateService.getDiscardedCards();
            playerStateChangedEvent.discardedCards = discardedCards;
            playerStateChangedEvent.events = playerStateService.getEvents();
            opponentStateChangedEvent[itemNamesForOpponentByItemNameForPlayer.discardedCards] = discardedCards;
        }

        matchComService.emitToPlayer(playerId, 'stateChanged', playerStateChangedEvent);
        matchComService.emitToPlayer(opponentId, 'stateChanged', opponentStateChangedEvent);
    }

    function onAttackStationCards(playerId, { attackerCardId, targetStationCardIds }) {
        let opponentId = matchComService.getOpponentId(playerId);
        let opponentStateService = playerStateServiceById[opponentId];
        let opponentState = opponentStateService._getPlayerState();

        let playerStateService = playerStateServiceById[playerId];
        const attackerCardData = playerStateService
            .getCardsInOpponentZone()
            .find(c => c.id === attackerCardId);
        if (!attackerCardData) throw new CheatError('Can only attack station card from enemy zone');

        const opponentStationCards = opponentState.stationCards;
        const unflippedOpponentStationCards = opponentState.stationCards.filter(s => !s.flipped);
        if (unflippedOpponentStationCards.length > targetStationCardIds.length
            && attackerCardData.attack > targetStationCardIds.length) {
            throw new CheatError('Need more target station cards to attack');
        }

        const attackerCard = cardFactory.createCardForPlayer(attackerCardData, playerId);
        if (!attackerCard.canAttackStationCards()) {
            throw new CheatError('Cannot attack station');
        }
        if (targetStationCardIds.length > attackerCard.attack) {
            throw new CheatError('Cannot attack that many station cards with card');
        }

        const targetStationCards = opponentStationCards.filter(s => targetStationCardIds.includes(s.card.id));
        if (!targetStationCards.length) return;
        if (targetStationCards.some(c => c.flipped)) {
            throw new CheatError('Cannot attack a flipped station card');
        }

        for (let targetCardId of targetStationCardIds) {
            opponentStateService.updateStationCard(targetCardId, card => {
                card.flipped = true;
            });
        }

        playerStateService.registerAttack(attackerCardId);
        matchComService.emitToPlayer(opponentId, 'stateChanged', {
            stationCards: matchComService.prepareStationCardsForClient(opponentStateService.getStationCards())
        });
        matchComService.emitToPlayer(playerId, 'stateChanged', {
            opponentStationCards: matchComService.prepareStationCardsForClient(opponentStateService.getStationCards())
        });

        const gameOver = opponentStateService.getStationCards().filter(s => !s.flipped) === 0
            || playerStateService.getStationCards().filter(s => !s.flipped).length === 0;
        if (gameOver) {
            matchService.endMatch();
        }
    }
}

module.exports = AttackController;