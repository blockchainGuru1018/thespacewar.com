const Card = require('../../shared/card/Card.js');
const NeutralCard = require('../../shared/card/Neutral.js');
const cardIndex = require('../../shared/card/index.js');
const MatchInfoRepository = require('../../shared/match/MatchInfoRepository.js');
const EventRepository = require('../../shared/event/EventRepository.js');

module.exports = function CardFactory(deps) {

    const { getState } = deps.matchService;
    const matchService = deps.matchService;

    return {
        createCardForPlayer,
        createBehaviourCard
    };

    function createCardForPlayer(cardData, playerId) {
        const state = getState();
        return Card({
            card: cardData,
            playerId,
            eventRepository: EventRepository({
                events: state.playerStateById[playerId].events
            }),
            matchInfoRepository: MatchInfoRepository(state)
        });
    }

    function createBehaviourCard(card, playerId) {
        const state = getState();
        const Constructor = getCardConstructor(card);
        return Constructor({
            card,
            playerId,
            eventRepository: EventRepository({
                events: state.playerStateById[playerId].events
            }),
            matchInfoRepository: MatchInfoRepository(state),
            matchService
        });
    }

    function getCardConstructor({ name }) {
        return cardIndex[name] || NeutralCard;
    }
}