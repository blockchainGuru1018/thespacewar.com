const CardFactory = require('../../shared/card/CardFactory.js');
const MatchService = require('../../shared/match/MatchService.js');
const CardDataAssembler = require('../../shared/CardDataAssembler.js');
const mapFromClientToServerState = require('../match/mapFromClientToServerState.js');
const PlayerServiceProvider = require('../../shared/match/PlayerServiceProvider.js');
const ClientPlayerStateService = require('../match/ClientPlayerStateService.js');
const QueryEvents = require('../../shared/event/QueryEvents.js');
const EventRepository = require('../../shared/event/EventRepository.js');
module.exports = function ClientCardFactory({
    actionPointsCalculator
}) {

    const playerServiceProvider = PlayerServiceProvider();
    const matchService = new MatchService();
    const cardDataAssembler = CardDataAssembler();

    return {
        fromVuexStore
    };

    function fromVuexStore(cardInfo, state, { isOpponent = false, playerId = null } = {}) {
        let cardData = cardDataFromCardInfo(cardInfo);
        if (!state.playerOrder) {
            debugger;
        }
        const mappedState = mapFromClientToServerState(state);
        matchService.setState(mappedState);

        let cardOwnerId = isOpponent ? state.opponentUser.id : state.ownUser.id;
        if (playerId !== null) {
            cardOwnerId = playerId;
        }

        const eventRepository = EventRepository({ playerId: cardOwnerId, playerServiceProvider });
        const queryEvents = new QueryEvents({ eventRepository });
        const cardFactory = new CardFactory({ matchService, playerServiceProvider, queryEvents });
        const updateStore = UpdateStore(state);
        const playerStateService = PlayerStateService({
            cardFactory,
            updateStore,
            playerId: cardOwnerId,
            queryEvents
        });
        playerServiceProvider.registerService(PlayerServiceProvider.TYPE.state, cardOwnerId, playerStateService);

        return cardFactory.createCardForPlayer(cardData, cardOwnerId);
    }

    function cardDataFromCardInfo(cardInfo) {
        if (cardInfo.commonId) {
            return {
                ...cardDataAssembler.createFromCommonId(cardInfo.commonId),
                ...cardInfo
            };
        }
        return {
            ...cardInfo
        }
    }

    function PlayerStateService({ cardFactory, queryEvents, playerId, updateStore }) {
        return new ClientPlayerStateService({
            updateStore,
            playerId,
            matchService,
            actionPointsCalculator,
            queryEvents,
            cardFactory
        });
    }

    function UpdateStore(state) {
        return clientState => {
            let changedProperties = Object.keys(clientState);
            for (let property of changedProperties) {
                state[property] = clientState[property];
            }
        };
    }
}