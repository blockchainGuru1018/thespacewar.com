const playerStateServiceFactory = require("./playerStateServiceFactory.js");
const PlayerPhase = require('../../match/PlayerPhase.js');
const MatchService = require('../../match/MatchService.js');
const TurnControl = require('../../match/TurnControl.js');
const SourceFetcher = require('../../match/requirement/SourceFetcher.js');
const CanThePlayer = require('../../match/CanThePlayer.js');
const QueryEvents = require('../../event/QueryEvents.js');
const EventRepository = require('../../event/EventRepository2.js');

module.exports = function (state) {

    let objectsByNameAndPlayerId = {};

    const api = {
        stub,
        matchService: cached(matchService),
        playerPhase: cached(playerPhase),
        playerStateService: cached(playerStateService),
        turnControl: cached(turnControl),
        sourceFetcher: cached(sourceFetcher),
        canThePlayer: cached(canThePlayer),
        eventRepository: cached(eventRepository),
        opponentId: cached(opponentId),
        queryEvents: cached(queryEvents)
    };
    return api;

    function stub(name, playerId, object) {
        objectsByNameAndPlayerId[name + ':' + playerId] = object;
    }

    function turnControl(playerId) {
        return new TurnControl({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            playerPhase: api.playerPhase(playerId),
            opponentPhase: api.playerPhase(api.opponentId(playerId)),
        });
    }

    function sourceFetcher(playerId) {
        let canThePlayer1 = api.canThePlayer(playerId);
        return SourceFetcher({
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(opponentId(playerId)),
            canThePlayer: canThePlayer1
        });
    }

    function canThePlayer(playerId) {
        return new CanThePlayer({
            matchService: api.matchService(),
            queryEvents: api.queryEvents(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            playerStateService: api.playerStateService(playerId),
            turnControl: api.turnControl(playerId)
        });
    }

    function queryEvents(playerId) {
        return new QueryEvents({
            eventRepository: api.eventRepository(playerId),
            opponentEventRepository: api.eventRepository(api.opponentId(playerId)),
            matchService: api.matchService(playerId)
        });
    }

    function playerPhase(playerId) {
        return new PlayerPhase({
            matchService: api.matchService(),
            playerStateService: playerStateServiceFactory.fromIdAndState(playerId, state)
        });
    }

    function eventRepository(playerId) {
        return EventRepository({ playerStateService: api.playerStateService(playerId) });
    }

    function opponentId(playerId) {
        return api.matchService().getOpponentId(playerId);
    }

    function playerStateService(playerId) {
        return playerStateServiceFactory.fromIdAndState(playerId, state);
    }

    function matchService() {
        let matchService = new MatchService();
        matchService.setState(state);
        return matchService;
    }

    function cached(constructor) {
        const name = constructor.name;
        return (playerId) => {
            const key = name + ':' + playerId;
            const existingCopy = objectsByNameAndPlayerId[key];
            if (existingCopy) return existingCopy;

            const result = constructor(playerId);
            objectsByNameAndPlayerId[key] = result;
            return result;
        };
    }
};
