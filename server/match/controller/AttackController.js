const CheatError = require('../CheatError.js');
const { PHASES } = require('../../../shared/phases.js');

function AttackController(deps) {

    const {
        matchService,
        matchComService,
        cardFactory,
        playerServiceProvider,
        playerRequirementUpdaterFactory
    } = deps;

    return {
        onAttack,
        onAttackStationCards,
        onDamageOwnStationCard
    }

    function onAttack(playerId, { attackerCardId, defenderCardId }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerPhase = playerStateService.getPhase();
        if (playerPhase !== PHASES.attack) throw new CheatError('Cannot attack when not in attack phase');

        const attackerCardData = playerStateService.findCard(attackerCardId);

        const attackerCard = cardFactory.createCardForPlayer(attackerCardData, playerId);
        if (!attackerCard.canAttack()) throw new CheatError('Cannot attack with card');

        const opponentId = matchComService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        const defenderCardData = opponentStateService.findCard(defenderCardId);
        const defenderCard = cardFactory.createCardForPlayer(defenderCardData, opponentId);
        if (!attackerCard.canAttackCard(defenderCard)) throw new CheatError('Cannot attack that card');

        attackerCard.attackCard(defenderCard);

        matchComService.emitToPlayer(opponentId, 'opponentAttackedCard', {
            attackerCardId,
            defenderCardId,
            newDamage: defenderCard.damage,
            defenderCardWasDestroyed: defenderCard.destroyed,
            attackerCardWasDestroyed: attackerCard.destroyed
        });
        playerStateService.registerAttack(attackerCardId);

        if (defenderCard.destroyed) {
            opponentStateService.removeCard(defenderCardId);
            opponentStateService.discardCard(defenderCardData);
        }
        else {
            opponentStateService.updateCard(defenderCardId, card => {
                card.damage = defenderCard.damage;
            });
        }

        if (attackerCard.destroyed) {
            playerStateService.removeCard(attackerCardId);
            playerStateService.discardCard(attackerCardData);
        }
    }

    function onAttackStationCards(playerId, { attackerCardId, targetStationCardIds }) {
        let opponentId = matchComService.getOpponentId(playerId);
        let opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        let opponentState = opponentStateService.getPlayerState();

        let playerStateService = playerServiceProvider.getStateServiceById(playerId);
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
            opponentStateService.flipStationCard(targetCardId);
        }

        playerStateService.registerAttack(attackerCardId);

        const gameOver = opponentStateService.getStationCards().filter(s => !s.flipped) === 0
            || playerStateService.getStationCards().filter(s => !s.flipped).length === 0;
        if (gameOver) {
            matchService.endMatch();
        }
    }

    function onDamageOwnStationCard(playerId, { targetIds }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        const damageOwnStationCardRequirement = playerRequirementService.getFirstMatchingRequirement({ type: 'damageOwnStationCard' });
        if (!damageOwnStationCardRequirement) {
            throw new CheatError('Cannot damage station card');
        }
        if (damageOwnStationCardRequirement.count < targetIds.length) {
            throw new CheatError('Cannot damage station card');
        }

        for (const targetId of targetIds) {
            if (!playerStateService.hasCardInStationCards(targetId)) {
                throw new CheatError('Cannot damage station card');
            }
        }

        for (const targetId of targetIds) {
            playerStateService.flipStationCard(targetId);
        }

        const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'damageOwnStationCard' });
        requirementUpdater.progressRequirementByCount(targetIds.length);
    }
}

module.exports = AttackController;