const CardFactory = require('../../shared/card/CardFactory.js');
const MatchService = require('../../shared/match/MatchService.js');
const CardDataAssembler = require('../../shared/CardDataAssembler.js');
const mapFromClientToServerState = require('../match/mapFromClientToServerState.js');
const PlayerServiceProvider = require('../../shared/match/PlayerServiceProvider.js');
const ClientPlayerStateService = require('../match/ClientPlayerStateService.js');
const QueryEvents = require('../../shared/event/QueryEvents.js');
const EventRepository = require('../../shared/event/EventRepository.js');
const CanThePlayer = require('../../shared/match/CanThePlayer.js');

module.exports = function ClientCardFactory({
    actionPointsCalculator
}) {

    const playerServiceProvider = PlayerServiceProvider();
    const matchService = new MatchService();
    const cardDataAssembler = CardDataAssembler();

    return {
        fromVuexStore
    };

    function bootstrapPlayerData(playerId, updateStore) {
        const eventRepository = EventRepository({ playerId, playerServiceProvider });
        const queryEvents = new QueryEvents({ eventRepository });
        const cardFactory = new CardFactory({ matchService, playerServiceProvider, queryEvents });
        const playerStateService = PlayerStateService({
            cardFactory,
            updateStore,
            playerId,
            queryEvents
        });
        return { cardFactory, playerStateService };
    }

    function fromVuexStore(cardInfo, clientState, { isOpponent = false, playerId = null } = {}) {
        let cardData = cardDataFromCardInfo(cardInfo);
        const mappedState = mapFromClientToServerState(clientState);
        matchService.setState(mappedState);

        let cardOwnerId = isOpponent ? clientState.opponentUser.id : clientState.ownUser.id;
        if (playerId !== null) {
            cardOwnerId = playerId;
        }

        const updateStore = UpdateStore(clientState);

        const opponentId = cardOwnerId === clientState.ownUser.id ? clientState.opponentUser.id : clientState.ownUser.id;
        const { playerStateService: opponentStateService } = bootstrapPlayerData(opponentId, updateStore);

        const { cardFactory, playerStateService } = bootstrapPlayerData(cardOwnerId, updateStore);
        playerServiceProvider.registerService(PlayerServiceProvider.TYPE.state, cardOwnerId, playerStateService);
        let canThePlayer = new CanThePlayer({ playerStateService, opponentStateService });
        playerServiceProvider.registerService(PlayerServiceProvider.TYPE.canThePlayer, cardOwnerId, canThePlayer);

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