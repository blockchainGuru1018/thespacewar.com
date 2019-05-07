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
    let todo = [];

    return {
        start
    };

    function start() {
        startQueueWork();

        rootStore.watch(() => rootStore.state.match.phase, onPhaseChange);
        rootStore.watch(() => rootStore.state.match.requirements, onRequirementsChange);
        rootStore.watch(() => rootStore.state.match.stationCards, onStationCardsChange);
        rootStore.watch(() => rootStore.state.match.currentPlayer, onCurrentPlayerChange);

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

        whileConditionThinkWhatToDo(
            () => hasSomeRequirement(),
            () => handleRequirements()
        );
    }

    async function onStationCardsChange() {
        if (ended) return;

        const unflippedStationCardCount = getPlayerStateService()
            .getStationCards()
            .filter(s => !s.flipped)
            .length;

        if (unflippedStationCardCount === 0) {
            doAllLater(...handleGameEnded());
        }
    }

    async function onCurrentPlayerChange() {
        if (opponentHasControl()) {
            clearMind();
        }
        else {
            await onPhaseChange(rootStore.state.match.phase);
        }
    }

    function handleGameEnded() {
        return [
            () => waitMilliseconds(5000),
            () => {
                ended = true;
                lost = hasLostGame();
                kill();

                $('.endGameButton').click();

                if (lost) {
                    doAllLater([
                        () => waitMilliseconds(1000),
                        () => {
                            const secondUserInLobby = $$('.user')[1];
                            secondUserInLobby.click();
                        },
                        () => {
                            waitMilliseconds(1000)
                        },
                        () => {
                            $('.startAi').click();
                        }
                    ]);
                }
                else {
                    doAllLater([
                        () => waitMilliseconds(2000),
                        () => $('.startAi').click()
                    ]);
                }
            }
        ];
    }

    function onPhaseChange(phase) {
        if (ended) {
            kill();
            return;
        }
        if (opponentHasControl()) {
            clearMind();
            return;
        }

        lastRun = Date.now();
        const state = rootStore.state.match;

        if (gameHasEnded()) {
            doAllLater(...handleGameEnded());
        }
        else if (hasSomeRequirement()) {
            whileConditionThinkWhatToDo(() => hasSomeRequirement(), () => handleRequirements());
        }
        else if (phase === 'start') {
            doLater(() => matchController.emit('nextPhase'));
        }
        else if (phase === 'draw') {
            whileConditionToThisAndAfterDoThat(
                () => hasDrawCardRequirement(),
                () => matchController.emit('drawCard'),
                () => {
                    doAllLater([
                        () => matchController.emit('drawCard'),
                        () => wait(),
                        () => {
                            // if (state.phase === 'draw') doLater(() => onPhaseChange('draw'));
                        }
                    ]);
                }
            );
        }
        else if (phase === 'action') {
            doAllLater([
                () => {
                    const cardToPutDownInStation = leastExpensiveAffordableCardOnHand();
                    if (cardToPutDownInStation) {
                        doAllFirst([
                            () => matchController.emit('putDownCard', {
                                cardId: cardToPutDownInStation.id,
                                location: 'station-' + randomStationRow()
                            }),
                            () => wait()
                        ]);
                    }
                },
                () => {
                    let tries = 0;
                    whileConditionThinkWhatToDoAndAfterDoThis(
                        () => getActionPoints() > 0 && tries <= 3,
                        () => {
                            const jobs = [];

                            const card = mostExpensiveAffordableCardOnHand();
                            if (card) {
                                jobs.push(
                                    ...putDownCardInHomeZone(card),
                                    () => wait()
                                );
                            }

                            jobs.push(() => tries++);

                            return jobs;
                        },
                        () => {
                            matchController.emit('nextPhase');
                        }
                    );
                }
            ]);
        }
        else if (phase === 'discard') {
            if (mustDiscardCard()) {
                doAllLater([
                    () => {
                        const card = leastExpensiveCardOnHand();
                        matchController.emit('discardCard', card.id);
                    },
                    () => wait(),
                    () => {
                        // if (state.phase === 'discard') doLater(() => onPhaseChange('discard'));
                    },
                    () => wait()
                ]);
            }
            else {
                doLater(() => matchController.emit('nextPhase'));
            }
        }
        else if (phase === 'attack') {
            if (hasOpponentCardsInHomeZone()) {
                doAllLater(defendHomeZone());
            }

            getCardsInHomeZone()
                .forEach(card => {
                    doAllLater([
                        ...moveCard(card),
                        () => wait()
                    ]);
                });

            getAllCardsThatCanAttack()
                .forEach(card => {
                    doAllLater([
                        ...attackFirstPossibleTargetWithCard(card),
                        () => wait()
                    ]);
                });

            doLater(() => matchController.emit('nextPhase'));
        }
    }

    async function startQueueWork() {
        await work();

        async function work() {
            const nextJob = todo.shift();
            console.log('nextJob?', nextJob);
            if (nextJob) {
                await nextJob();
            }

            setTimeout(work, WaitTime);
        }
    }

    function kill() {
        clearInterval(lifelineId);
        clearMind();
    }

    function clearMind() {
        todo = [];
    }

    function doLater(callback) {
        todo.push(callback);
    }

    function doFirst(callback) {
        todo.unshift(callback);
    }

    function doAllFirst(callbacks) {
        todo.unshift(...callbacks);
    }

    function doAllLater(callbacks) {
        todo.push(...callbacks);
    }

    function randomStationRow() {
        const locations = ['draw', 'action', 'handSize'];
        const randomIndex = Math.round(Math.random() * (locations.length - 1));
        return locations[randomIndex];
    }

    function hasOpponentCardsInHomeZone() {
        const cardsInOpponentZone = getOpponentStateService().getCardsInOpponentZone();
        return cardsInOpponentZone.length > 0;
    }

    function moveCard(card) {
        if (!card.canMove()) return [];

        const cardIsMissile = card.type === 'missile';
        const wantsToMove = Math.random() > behaviour.aggressiveness;

        if (wantsToMove || cardIsMissile) {
            return [() => matchController.emit('moveCard', card.id)];
        }
        else {
            return [];
        }
    }

    function defendHomeZone() {
        return getAllCardsThatCanAttack({ homeZone: true, opponentZone: false })
            .flatMap(defender => [
                ...attackFirstPossibleTargetWithCard(defender),
                () => wait
            ]);
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

            return [() => matchController.emit('attackStationCard', { attackerCardId, targetStationCardIds })];
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

            return [() => matchController.emit('attack', { attackerCardId, defenderCardId })];
        }
    }

    function handleRequirements() {
        if (hasWaitingRequirement()) {
            return [
                () => whileConditionDoThis(
                    () => hasWaitingRequirement(),
                    () => lastRun = Date.now()
                )
            ];
        }
        else if (hasDrawCardRequirement()) {
            return [
                () => matchController.emit('drawCard'),
                () => wait()
            ];
        }
        else if (hasDamageStationCardRequirement()) {
            const requirement = getDamageStationCardRequirement();
            const opponentStateService = rootStore.getters['match/opponentStateService'];
            const targetIds = opponentStateService
                .getStationCards()
                .filter(s => !s.flipped)
                .map(s => s.id)
                .slice(0, requirement.count);

            return [
                () => matchController.emit('damageStationCards', { targetIds }),
                () => wait()
            ];
        }
        else if (hasDiscardCardRequirement()) {
            const requirement = getDiscardCardRequirement();
            return flatMap(
                range(0, requirement.count - 1),
                () => [
                    () => {
                        const card = leastExpensiveCardOnHand();
                        matchController.emit('discardCard', card.id);
                    },
                    () => wait()
                ]);
        }
        else {
            return [];
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
        return [
            () => matchController.emit('putDownCard', {
                cardId: id,
                location: 'zone'
            })
        ]
    }

    function opponentHasControl() {
        return rootStore.getters['match/turnControl'].opponentHasControlOfPlayersTurn()
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

    function waitForQueue() {
        return new Promise(resolve => {
            const intervalId = setInterval(() => {
                if (todo.length === 0) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, WaitTime / 2);
            // await waitMilliseconds(WaitTime);
        });
    }

    function whileConditionToThisAndAfterDoThat(condition, job, onDone) {
        doAllFirst([
            job,
            () => {
                if (condition()) whileConditionToThisAndAfterDoThat(condition, job);
                else doFirst(onDone);
            }
        ]);
    }

    function whileConditionThinkWhatToDo(condition, getJobs) {
        const jobs = getJobs();
        doAllFirst([
            ...jobs,
            () => {
                if (condition()) whileConditionThinkWhatToDo(condition, getJobs);
            }
        ]);
    }

    function whileConditionThinkWhatToDoAndAfterDoThis(condition, getJobs, onDone) {
        const jobs = getJobs();
        doAllFirst([
            ...jobs,
            () => {
                if (condition()) whileConditionThinkWhatToDoAndAfterDoThis(condition, getJobs, onDone);
                else doFirst(onDone);
            }
        ]);
    }

    function whileConditionDoThis(condition, job) {
        doAllFirst([
            job,
            () => {
                if (condition()) {
                    whileConditionToThisAndAfterDoThat(condition, job);
                }
            }
        ]);
    }

    function range(start, end) {
        const numbers = [];
        for (let i = start; i <= end; i++) {
            numbers.push(i);
        }
        return numbers;
    }

    async function wait() {
        await waitMilliseconds(WaitTime);
    }
};

function waitMilliseconds(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

function flatMap(collection, fn) {
    const result = [];
    for (item of collection) {
        result.push(fn(item));
    }
    return result;
}
