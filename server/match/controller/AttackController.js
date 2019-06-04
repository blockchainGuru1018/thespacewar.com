const CheatError = require('../CheatError.js');
const PlayerServiceProvider = require("../../../shared/match/PlayerServiceProvider.js");

const MAX_COLLISION_TARGETS_ON_SACRIFICE = 4;

function AttackController(deps) {

    const {
        matchService,
        matchComService,
        cardFactory,
        stateSerializer,
        playerServiceProvider,
        playerServiceFactory,
        stateMemento,
        playerRequirementUpdaterFactory
    } = deps;

    return {
        onAttack,
        counterAttack,
        cancelCounterAttack,
        onAttackStationCards,
        onDamageStationCard,
        onSacrifice
    };

    function onAttack(playerId, { attackerCardId, defenderCardId }) {
        validateAttack({ playerId, attackerCardId, defenderCardId });

        const stateBeforeAttack = stateSerializer.serialize(matchService.getState());

        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        const defenderCard = opponentStateService.createBehaviourCardById(defenderCardId);
        const attackerCard = playerStateService.createBehaviourCardById(attackerCardId);

        const damageBefore = defenderCard.damage;
        attackerCard.attackCard(defenderCard);
        const damageAfter = defenderCard.damage;

        const defenderCardWasDestroyed = defenderCard.destroyed;
        matchComService.emitToPlayer(opponentId, 'opponentAttackedCard', {
            attackerCardId,
            defenderCardId,
            newDamage: defenderCard.damage,
            defenderCardWasDestroyed,
            attackerCardWasDestroyed: attackerCard.destroyed
        });

        const event = playerStateService.registerAttack({ attackerCardId, defenderCardId });
        const attackData = { attackerCardId, defenderCardIds: [defenderCardId], time: event.created };
        stateMemento.saveStateForAttackData(stateBeforeAttack, attackData);

        const opponentActionLog = playerServiceFactory.actionLog(opponentId);
        if (defenderCardWasDestroyed) {
            opponentActionLog.cardDestroyed({ cardCommonId: defenderCard.commonId })
        }
        else if (damageBefore !== damageAfter) {
            opponentActionLog.damagedInAttack({
                defenderCardId,
                defenderCardCommonId: defenderCard.commonId,
                damageInflictedByDefender: damageAfter - damageBefore
            })
        }

        if (defenderCardWasDestroyed) {
            const cardData = opponentStateService.removeCard(defenderCardId);
            opponentStateService.discardCard(cardData);
        }
        else {
            opponentStateService.updateCardById(defenderCardId, card => {
                Object.assign(card, defenderCard.getCardData());
            });
        }

        if (attackerCard.destroyed) {
            const cardData = playerStateService.removeCard(attackerCardId);
            playerStateService.discardCard(cardData);
        }
        else {
            playerStateService.updateCardById(attackerCardId, card => {
                Object.assign(card, attackerCard.getCardData());
            });
        }
    }

    function counterAttack(playerId, { attackIndex }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);

        validateIfCanProgressCounterAttackRequirementByCount(1, playerId);

        const playerRequirementService = playerServiceFactory.playerRequirementService(playerId);
        const counterAttackRequirement = playerRequirementService.getFirstMatchingRequirement({ type: 'counterAttack' });
        const attackData = counterAttackRequirement.attacks[attackIndex];
        if (!attackData) {
            throw new CheatError('Cannot find attack at index in requirement');
        }

        progressCounterCardRequirementByCount(1, playerId);

        stateMemento.revertStateToBeforeAttack(attackData);

        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        const options = {
            attackerCardId: attackData.attackerCardData.id,
        };
        if (attackData.targetedStation) {
            options.targetStationCardIds = attackData.defenderCardsData.map(cardData => cardData.id);
        }
        else {
            options.defenderCardId = attackData.defenderCardsData[0].id;
        }
        opponentStateService.registerAttackCountered(options);

        const cardUsedToCounterId = counterAttackRequirement.cardId;
        playerStateService.useToCounter(cardUsedToCounterId);

        if (attackData.targetedStation) {
            const opponentActionLog = playerServiceFactory.actionLog(opponentId);
            opponentActionLog.opponentCounteredAttackOnStation({
                targetStationCardIds: attackData.defenderCardsData.map(cardData => cardData.id)
            });
        }
        else {
            const opponentActionLog = playerServiceFactory.actionLog(opponentId);
            const defenderCardsData = attackData.defenderCardsData[0];
            opponentActionLog.opponentCounteredAttackOnCard({
                defenderCardId: defenderCardsData.id,
                defenderCardCommonId: defenderCardsData.commonId
            });
        }

        matchComService.emitCurrentStateToPlayers();
    }

    function cancelCounterAttack(playerId, { cardId }) {
        validateIfCanProgressCounterAttackRequirementByCount(0, playerId);
        stateMemento.revertStateToBeforeCardWasPutDown(cardId);
        matchComService.emitCurrentStateToPlayers();
    }

    function validateIfCanProgressCounterAttackRequirementByCount(count, playerId) {
        const playerRequirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'counterAttack' });
        let canProgressRequirement = playerRequirementUpdater.canProgressRequirementByCount(count);
        if (!canProgressRequirement) {
            throw new CheatError('Cannot counter attack');
        }
    }

    function progressCounterCardRequirementByCount(count, playerId) {
        const playerRequirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'counterAttack' });
        playerRequirementUpdater.progressRequirementByCount(count);
    }

    function validateAttack({ playerId, attackerCardId, defenderCardId }) {
        const canThePlayer = playerServiceProvider.byTypeAndId(PlayerServiceProvider.TYPE.canThePlayer, playerId);
        const canAttack = canThePlayer.attackCards();
        if (!canAttack) throw new CheatError('Cannot attack');

        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const attackerCardData = playerStateService.findCard(attackerCardId);
        const attackerCard = cardFactory.createCardForPlayer(attackerCardData, playerId);
        if (!attackerCard.canAttack()) throw new CheatError('Cannot attack');

        const opponentId = matchComService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        const defenderCardData = opponentStateService.findCard(defenderCardId);
        const defenderCard = cardFactory.createCardForPlayer(defenderCardData, opponentId);
        if (!attackerCard.canAttackCard(defenderCard)) throw new CheatError('Cannot attack that card');
    }

    function onAttackStationCards(playerId, { attackerCardId, targetStationCardIds }) {
        validateAttackOnStationCards(playerId, { attackerCardId, targetStationCardIds });

        let opponentId = matchComService.getOpponentId(playerId);
        let opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        const targetStationCards = opponentStateService.getStationCards().filter(s => targetStationCardIds.includes(s.card.id));
        if (!targetStationCards.length) return;

        const stateBeforeAttack = stateSerializer.serialize(matchService.getState());

        for (let targetCardId of targetStationCardIds) {
            opponentStateService.flipStationCard(targetCardId);
        }

        let playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const event = playerStateService.registerAttack({ attackerCardId, targetStationCardIds });

        const attackData = { attackerCardId, defenderCardIds: targetStationCardIds, time: event.created };
        stateMemento.saveStateForAttackData(stateBeforeAttack, attackData);

        const opponentActionLog = playerServiceFactory.actionLog(opponentId);
        opponentActionLog.stationCardsWereDamaged({ targetCount: targetStationCardIds.length });

        const attackerCardData = playerStateService.findCard(attackerCardId);
        const attackerCard = cardFactory.createCardForPlayer(attackerCardData, playerId);
        if (attackerCard.type === 'missile') {
            playerStateService.removeCard(attackerCardId);
            playerStateService.discardCard(attackerCardData);
        }

        const gameOver = opponentStateService.getStationCards().filter(s => !s.flipped) === 0
            || playerStateService.getStationCards().filter(s => !s.flipped).length === 0;
        if (gameOver) {
            matchService.endMatch();
        }
    }

    function validateAttackOnStationCards(playerId, { attackerCardId, targetStationCardIds }) {
        let cannotAttackStationCards = playerServiceProvider.byTypeAndId(PlayerServiceProvider.TYPE.canThePlayer, playerId).attackStationCards();
        if (!cannotAttackStationCards) throw new CheatError('Cannot attack station cards');

        let opponentId = matchComService.getOpponentId(playerId);
        let opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        let opponentState = opponentStateService.getPlayerState();
        let playerStateService = playerServiceProvider.getStateServiceById(playerId);

        const attackerCardData = playerStateService.findCard(attackerCardId);
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
        if (targetStationCards.some(c => c.flipped)) {
            throw new CheatError('Cannot attack a flipped station card');
        }
    }

    function onDamageStationCard(playerId, { targetIds }) {
        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        const damageStationCardRequirement = playerRequirementService.getFirstMatchingRequirement({ type: 'damageStationCard' });
        if (!damageStationCardRequirement) {
            throw new CheatError('Cannot damage station card');
        }
        if (damageStationCardRequirement.count < targetIds.length) {
            throw new CheatError('Cannot damage station card');
        }

        for (const targetId of targetIds) {
            if (!opponentStateService.hasCardInStationCards(targetId)) {
                throw new CheatError('Cannot damage station card');
            }
        }

        for (const targetId of targetIds) {
            opponentStateService.flipStationCard(targetId);
        }

        const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'damageStationCard' });
        requirementUpdater.progressRequirementByCount(targetIds.length);
    }

    function onSacrifice(playerId, { cardId, targetCardId, targetCardIds }) {
        if (!!targetCardIds && !!targetCardId) throw new CheatError('Cannot sacrifice');

        let cannotSacrifice = playerServiceProvider.byTypeAndId(PlayerServiceProvider.TYPE.canThePlayer, playerId).sacrificeCards();
        if (!cannotSacrifice) throw new CheatError('Cannot sacrifice');

        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);

        if (targetCardIds) {
            if (!isValidStationCollisionFromSacrifice({ playerId, cardId, targetCardIds })) {
                throw new CheatError('Cannot sacrifice');
            }
        }
        else {
            const targetCardData = opponentStateService.findCard(targetCardId);
            if (!targetCardId) throw new CheatError('Cannot sacrifice');
            if (!targetCardData) throw new CheatError('Cannot sacrifice');
        }

        const cardData = playerStateService.findCard(cardId);
        const card = cardFactory.createCardForPlayer(cardData, playerId);
        if (!card.canBeSacrificed()) throw new CheatError('Cannot sacrifice');

        if (!targetCardIds) {
            const targetCardData = opponentStateService.findCard(targetCardId);
            const targetCard = cardFactory.createCardForPlayer(targetCardData, opponentId);
            if (!card.canTargetCardForSacrifice(targetCard)) throw new CheatError('Cannot sacrifice');
        }

        playerStateService.removeCard(cardId);
        playerStateService.discardCard(cardData);

        if (!targetCardIds) {
            opponentStateService.registerCardCollisionFromSacrifice(targetCardId);
        }
        else {
            onStationCollisionFromSacrifice({ playerId, targetCardIds });
        }
    }

    function isValidStationCollisionFromSacrifice({ playerId, cardId, targetCardIds }) {
        if (targetCardIds.length > MAX_COLLISION_TARGETS_ON_SACRIFICE) return false;
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cardData = playerStateService.findCard(cardId);
        const card = cardFactory.createCardForPlayer(cardData, playerId);
        if (card.isInHomeZone()) return false;

        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        if (opponentStateService.hasCardThatStopsStationAttack()) return false;

        const validTargetIdCount = targetCardIds
            .map(id => opponentStateService.findStationCard(id))
            .filter(card => !!card)
            .length;
        const availableTargetCount = opponentStateService
            .getStationCards()
            .filter(card => !card.flipped)
            .length;
        const isBelowTargetLimit = validTargetIdCount < MAX_COLLISION_TARGETS_ON_SACRIFICE;
        const hasMoreAvailableTargets = availableTargetCount > validTargetIdCount;

        return !isBelowTargetLimit
            || !hasMoreAvailableTargets;
    }

    function onStationCollisionFromSacrifice({ playerId, targetCardIds }) {
        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        opponentStateService.registerStationCollisionFromSacrifice(targetCardIds);
    }
}

module.exports = AttackController;
