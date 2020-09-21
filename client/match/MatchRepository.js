const ajax = require("../utils/ajax.js");

module.exports = function (deps) {
  const socket = deps.socket;
  const userRepository = deps.userRepository;

  return {
    create,
    createWithBot,
    getOwnState,
    onMatchCreatedForPlayer,
    onMatchInviteForPlayer,
    invitePlayer,
    declineInvitation,
    cancelInvitation,
    acceptInvitation,
  };

  async function invitePlayer(playerId, opponentId) {
    await ajax.jsonPost(`/match/invite`, { playerId, opponentId });
  }

  async function cancelInvitation(playerId, opponentId) {
    await ajax.jsonPost(`/match/cancel`, { playerId, opponentId });
  }
  async function acceptInvitation({ playerId, opponentId }) {
    return await ajax.jsonPost(`/match/accept`, { playerId, opponentId });
  }

  async function declineInvitation(playerId, opponentId) {
    await ajax.jsonPost(`/match/decline`, { playerId, opponentId });
  }

  function create({ playerId, opponentId }) {
    return ajax.jsonPost("/match", { playerId, opponentId });
  }

  function createWithBot({ playerId }) {
    return ajax.jsonPost(`/match/${encodeURIComponent(playerId)}/bot`);
  }

  async function getOwnState(matchId) {
    const playerId = userRepository.getOwnUser().id;
    return await ajax.get(`/match/${matchId}/player/${playerId}/state`);
  }
  function onMatchInviteForPlayer(callback) {
    socket.on("match/invitation", (invitations) => {
      callback(invitations);
    });
  }
  function onMatchCreatedForPlayer(callback) {
    socket.on("match/create", (matchData) => {
      const ownUserId = userRepository.getOwnUser().id;
      if (matchData.playerIds.includes(ownUserId)) {
        callback(matchData);
      }
    });
  }
};
