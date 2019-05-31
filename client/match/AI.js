const { PHASES } = require('../../shared/phases.js');
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const WaitTime = 800;

const DefaultBehaviour = {
    aggressiveness: .5
};

module.exports = function ({ rootStore, matchController, behaviour = DefaultBehaviour }) {

    let lastRun;
    let ended = false;
    let lost = false;
    let lifelineId;

    return {
        start
    }

    function start() {
        rootStore.watch(() => rootStore.state.match.phase, onPhaseChange);
        rootStore.watch(() => rootStore.state.match.requirements, onRequirementsChange);
        rootStore.watch(() => rootStore.state.match.stationCards, onStationCardsChange);

        onPhaseChange(rootStore.state.match.phase);

        lifelineId = setInterval(() => {
            if (ended) {
                clearInterval(lifelineId);
                return;
            }

            const timeSinceLastRun = Date.now() - lastRun;
            if (timeSinceLastRun < 5000) onPhaseChange(rootStore.state.match.phase);
        }, 5000);
    }

    async function onRequirementsChange() {
        if (ended) return;

        const state = rootStore.state.match;
        if (state.phase !== PHASES.wait) return;

        if (hasSomeRequirement()) {
            await handleRequirements();
        }
    }

    async function onStationCardsChange() {
        if (ended) return;

        const unflippedStationCardCount = getPlayerStateService()
            .getStationCards()
            .filter(s => !s.flipped)
            .length;

        if (unflippedStationCardCount === 0) {
            await handleGameEnded();
        }
    }

    async function handleGameEnded() {
        await wait(5000);

        ended = true;
        lost = hasLostGame();
        clearInterval(lifelineId);

        $('.endGameButton').click();
        if (lost) {
            await wait(1000);
            const secondUserInLobby = $$('.user')[1];
            secondUserInLobby.click();

            await wait(1000);
            //TODO MUST GO TO MENU
            $('.startAi').click();
        }
        else {
            await wait(2000);
            //TODO MUST GO TO MENU
            $('.startAi').click();
        }
    }

    async function onPhaseChange(phase) {
        if (ended) {
            clearInterval(lifelineId);
            return;
        }

        lastRun = Date.now();
        const state = rootStore.state.match;

        if (gameHasEnded()) {
            await handleGameEnded();
        }
        else if (hasSomeRequirement()) {
            await handleRequirements();
            setTimeout(() => onPhaseChange(state.phase));
        }
        else if (phase === 'start') {
            matchController.emit('nextPhase');
        }
        else if (phase === 'draw') {
            while (hasDrawCardRequirement()) {
                matchController.emit('drawCard');
            }

            matchController.emit('drawCard');
            await wait(WaitTime);
            if (state.phase === 'draw')
                setTimeout(() => onPhaseChange('draw'));

        }
        else if (phase === 'action') {
            const cardToPutDownInStation = leastExpensiveAffordableCardOnHand();
            if (cardToPutDownInStation) {
                matchController.emit('putDownCard', {
                    cardId: cardToPutDownInStation.id,
                    location: 'station-' + randomStationRow()
                });
                await wait(WaitTime);
            }

            let tries = 0;
            while (getActionPoints() > 0 && tries <= 3) {
                const card = mostExpensiveAffordableCardOnHand();
                if (card) {
                    putDownCardInHomeZone(card);
                    await wait(WaitTime);
                }

                tries++;
            }

            matchController.emit('nextPhase');
        }
        else if (phase === 'discard') {
            if (mustDiscardCard()) {
                const card = leastExpensiveCardOnHand();
                matchController.emit('discardCard', card.id);

                await wait(WaitTime);
                if (state.phase === 'discard')
                    setTimeout(() => onPhaseChange('discard'));
            }
            else {
                matchController.emit('nextPhase');
            }
        }
        else if (phase === 'attack') {
            if (hasOpponentCardsInHomeZone()) {
                await defendHomeZone();
            }

            for (const card of getCardsInHomeZone()) {
                moveCard(card);
                await wait(WaitTime);
            }

            for (const card of getAllCardsThatCanAttack()) {
                attackFirstPossibleTargetWithCard(card);
                await wait(WaitTime);
            }

            matchController.emit('nextPhase');
        }
    }

    function randomStationRow() {
        const locations = ['draw', 'action', 'handSize'];
        const randomIndex = Math.round(Math.random() * (locations.length - 1));
        return locations[randomIndex];
    }

    function hasOpponentCardsInHomeZone() {
        const cardsInOpponentZone = getOpponentStateService().getCardsInOpponentZone()
        return cardsInOpponentZone.length > 0;
    }

    function moveCard(card) {
        if (!card.canMove()) return;

        const cardIsMissile = card.type === 'missile';
        const wantsToMove = Math.random() > behaviour.aggressiveness

        if (wantsToMove || cardIsMissile) {
            matchController.emit('moveCard', card.id);
        }
    }

    async function defendHomeZone() {
        const availableDefenders = getAllCardsThatCanAttack({ homeZone: true, opponentZone: false });
        for (const defender of availableDefenders) {
            attackFirstPossibleTargetWithCard(defender);
            await wait(WaitTime);
        }
    }

    function getAllCardsThatCanAttack({ homeZone = true, opponentZone = true } = {}) {
        const playerStateService = getPlayerStateService();
        const cardsData = [
            ...(homeZone ? playerStateService.getCardsInZone() : []),
            ...(opponentZone ? playerStateService.getCardsInOpponentZone() : [])
        ];
        const cards = cardsData.map(cardData => playerStateService.createBehaviourCard(cardData));
        return cards.filter(card => {
            return card.canAttack()
                && (card.canAttackCardsInOtherZone() || canAttackSomeCardInSameZone(card))
        });
    }

    function attackFirstPossibleTargetWithCard(card) {
        const attackerCardId = card.id;

        if (canAttackStationCards(card)) {
            const opponentStateService = rootStore.getters['match/opponentStateService'];
            const targetStationCardIds = opponentStateService.getStationCards()
                .filter(s => !s.flipped)
                .slice(0, card.attack)
                .map(s => s.id);
            matchController.emit('attackStationCard', { attackerCardId, targetStationCardIds });
        }
        else {
            let defenderCardId;
            if (canAttackCardInZone(card)) {
                const opponentStateService = rootStore.getters['match/opponentStateService'];
                const opponentCardsDataInZone = card.isInHomeZone()
                    ? opponentStateService.getCardsInOpponentZone()
                    : opponentStateService.getCardsInZone();
                const opponentCardsInZone = opponentCardsDataInZone
                    .map(data => opponentStateService.createBehaviourCard(data));
                defenderCardId = opponentCardsInZone.find(c => card.canAttackCard(c)).id;
            }
            else if (card.canAttackCardsInOtherZone()) {
                const opponentStateService = rootStore.getters['match/opponentStateService'];
                const opponentCardsDataInZone = card.isInHomeZone()
                    ? opponentStateService.getCardsInZone()
                    : opponentStateService.getCardsInOpponentZone();
                const opponentCardsInZone = opponentCardsDataInZone
                    .map(data => opponentStateService.createBehaviourCard(data));
                defenderCardId = opponentCardsInZone.find(c => card.canAttackCard(c)).id;
            }

            matchController.emit('attack', { attackerCardId, defenderCardId });
        }
    }

    async function handleRequirements() {
        if (hasWaitingRequirement()) {
            while (hasWaitingRequirement()) {
                lastRun = Date.now();
                await wait(WaitTime);
            }
        }
        else if (hasDrawCardRequirement()) {
            matchController.emit('drawCard');
            await wait(WaitTime);
        }
        else if (hasDamageStationCardRequirement()) {
            const requirement = getDamageStationCardRequirement();
            const opponentStateService = rootStore.getters['match/opponentStateService'];
            const targetIds = opponentStateService
                .getStationCards()
                .filter(s => !s.flipped)
                .map(s => s.id)
                .slice(0, requirement.count);
            matchController.emit('damageStationCards', { targetIds });

            await wait(WaitTime);
        }
        else if (hasDiscardCardRequirement()) {
            const requirement = getDiscardCardRequirement();
            for (let i = 0; i < requirement.count; i++) {
                const card = leastExpensiveCardOnHand();
                matchController.emit('discardCard', card.id);
            }

            await wait(WaitTime);
        }
    }

    function canAttackSomeCardInSameZone(card) {
        return canAttackCardInZone(card) || canAttackStationCards(card);
    }

    function canAttackCardInZone(card) {
        const opponentStateService = rootStore.getters['match/opponentStateService'];
        const opponentCardsDataInZone = card.isInHomeZone()
            ? opponentStateService.getCardsInOpponentZone()
            : opponentStateService.getCardsInZone();

        const opponentCardsInZone = opponentCardsDataInZone
            .map(data => opponentStateService.createBehaviourCard(data));

        const attackableTargets = opponentCardsInZone.filter(target => {
            return card.canAttackCard(target)
        });
        return attackableTargets.length > 0;
    }

    function canAttackStationCards(card) {
        const opponentStateService = rootStore.getters['match/opponentStateService'];
        const opponentStationCards = opponentStateService.getStationCards();
        return card.canAttackStationCards()
            && opponentStationCards.length > 0;
    }

    function getCardsInHomeZone() {
        const playerStateService = getPlayerStateService()
        return playerStateService
            .getCardsInZone()
            .map(data => playerStateService.createBehaviourCard(data));
    }

    function getPlayerStateService() {
        return rootStore.getters['match/playerStateService'];
    }

    function getOpponentStateService() {
        return rootStore.getters['match/opponentStateService'];
    }

    function mustDiscardCard() {
        const playerStateService = rootStore.getters['match/playerStateService'];
        const cardsOnHandCount = playerStateService.getCardsOnHand().length;
        return cardsOnHandCount > maxHandSize();
    }

    function maxHandSize() {
        return rootStore.getters['match/playerRuleService'].getMaximumHandSize();
    }

    function leastExpensiveCardOnHand() {
        const playerStateService = rootStore.getters['match/playerStateService'];
        return playerStateService.getCardsOnHand().sort((a, b) => a.cost - b.cost)[0];
    }

    function leastExpensiveAffordableCardOnHand() {
        const playerStateService = rootStore.getters['match/playerStateService'];
        const actionPoints = playerStateService.getActionPointsForPlayer();
        return playerStateService
            .getCardsOnHand()
            .filter(c => c.cost <= actionPoints)
            .sort((a, b) => a.cost - b.cost)[0];
    }

    function getActionPoints() {
        const playerStateService = rootStore.getters['match/playerStateService'];
        return playerStateService.getActionPointsForPlayer();
    }

    function mostExpensiveAffordableCardOnHand() {
        const playerStateService = rootStore.getters['match/playerStateService'];
        const actionPoints = playerStateService.getActionPointsForPlayer();
        return playerStateService
            .getCardsOnHand()
            .filter(c => c.type === 'spaceShip' || c.type === 'missile')
            .filter(c => c.cost <= actionPoints)
            .sort((a, b) => b.cost - a.cost)[0];
    }

    function putDownCardInHomeZone({ id }) {
        matchController.emit('putDownCard', {
            cardId: id,
            location: 'zone'
        });
    }

    function hasSomeRequirement() {
        const state = rootStore.state.match;
        return state.requirements.length > 0;
    }

    function hasWaitingRequirement() {
        const state = rootStore.state.match;
        if (state.requirements.length === 0) return false;
        return state.requirements[0].waiting;
    }

    function hasDrawCardRequirement() {
        const state = rootStore.state.match;
        if (state.requirements.length === 0) return false;
        const firstRequirement = state.requirements[0];
        if (firstRequirement.type !== 'drawCard') return false;

        return firstRequirement.type === 'drawCard'
            && firstRequirement.count > 0;
    }

    function getDamageStationCardRequirement() {
        return getRequirementOfType('damageStationCard');
    }

    function hasDamageStationCardRequirement() {
        const requirement = getDamageStationCardRequirement();
        return requirement && requirement.count > 0;
    }

    function getDiscardCardRequirement() {
        return getRequirementOfType('discardCard');
    }

    function hasDiscardCardRequirement() {
        const requirement = getDiscardCardRequirement();
        return requirement && requirement.count > 0;
    }

    function getRequirementOfType(type) {
        const state = rootStore.state.match;
        if (state.requirements.length === 0) return null;
        const firstRequirement = state.requirements[0];
        if (firstRequirement.type !== type) return null;

        return firstRequirement;
    }

    function gameHasEnded() {
        return hasWonGame() || hasLostGame();
    }

    function hasWonGame() {
        const opponentStateService = rootStore.getters['match/opponentStateService'];
        return opponentStateService.getStationCards().filter(s => !s.flipped).length === 0;
    }

    function hasLostGame() {
        const playerStateService = rootStore.getters['match/playerStateService'];
        return playerStateService.getStationCards().filter(s => !s.flipped).length === 0;
    }
};

function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
