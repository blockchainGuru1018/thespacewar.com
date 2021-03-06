const localGameDataFacade = require("../utils/localGameDataFacade.js");
const createBotUser = require("../../shared/user/createBotUser.js");

module.exports = function ({
  matchRepository,
  userRepository,
  botUpdateListener,
  route,
  retrieveSession,
}) {
  return {
    namespaced: true,
    name: "lobby",
    state: {
      loggingOut: false,
      invitations: [],
    },
    getters: {
      currentInvitations,
    },
    actions: {
      init,
      startGameWithUser,
      invitePlayerToGame,
      declineInvitation,
      startGameWithBot,
      logout,
      showProfileUserPlayer,
      cancelInvitation,
      acceptInvitation,
    },
  };

  async function init({ state }) {
    matchRepository.onMatchCreatedForPlayer(joinMatch);
    matchRepository.onMatchInviteForPlayer((invitations) =>
      updateInvitations(state, invitations)
    );
  }

  function currentInvitations(state) {
    return state.invitations;
  }

  function updateInvitations(state, invitations) {
    console.log("invitations: ", invitations, state);
    state.invitations = invitations;
  }

  async function joinMatch({ id: matchId, playerIds }) {
    const ownUserId = userRepository.getOwnUser().id;
    const opponentUserId = playerIds.find((id) => id !== ownUserId);
    const users = userRepository.getAllLocal();
    const opponentUser = users.find((u) => u.id === opponentUserId);
    route("match", { matchId, opponentUser });
  }

  async function invitePlayerToGame(actionContext, opponentUser) {
    try {
      const playerId = userRepository.getOwnUser().id;
      const opponentId = opponentUser.id;
      await matchRepository.invitePlayer(playerId, opponentId);
    } catch (error) {
      alert("Could not invite player " + error.message);
    }
  }
  async function cancelInvitation(actionContext, opponentUser) {
    try {
      const playerId = userRepository.getOwnUser().id;
      const opponentId = opponentUser.id;
      await matchRepository.cancelInvitation(playerId, opponentId);
    } catch (error) {
      alert("Could not decline invitation " + error.message);
    }
  }
  async function declineInvitation(actionContext, opponentUser) {
    try {
      const playerId = userRepository.getOwnUser().id;
      const opponentId = opponentUser.id;
      await matchRepository.declineInvitation(playerId, opponentId);
    } catch (error) {
      alert("Could not decline invitation " + error.message);
    }
  }

  async function startGameWithUser(actionContext, opponentUser) {
    let matchId;
    try {
      const playerId = userRepository.getOwnUser().id;
      const opponentId = opponentUser.id;
      const match = await matchRepository.create({ playerId, opponentId });
      matchId = match.id;
    } catch (error) {
      alert("Could not create match: " + error.message);
    }

    if (matchId) {
      route("match", { matchId, opponentUser });
    }
  }
  async function acceptInvitation(actionContext, opponentUser) {
    let matchId;
    try {
      const playerId = userRepository.getOwnUser().id;
      const opponentId = opponentUser.id;
      const match = await matchRepository.acceptInvitation({
        playerId,
        opponentId,
      });
      matchId = match.id;
    } catch (error) {
      alert("Could not create match: " + error.message);
    }
    if (matchId) {
      route("match", { matchId, opponentUser });
    }
  }

  async function startGameWithBot() {
    let matchId;

    try {
      const playerId = userRepository.getOwnUser().id;
      const match = await matchRepository.createWithBot({ playerId });
      matchId = match.id;
    } catch (error) {
      alert("Could not create match: " + error.message);
    }

    if (matchId) {
      const botUser = createBotUser();
      route("match", {
        matchId,
        opponentUser: botUser,
      });
      botUpdateListener.start({
        matchId,
        botUser,
        playerUser: userRepository.getOwnUser(),
      });
    }
  }

  async function showProfileUserPlayer() {
    return retrieveSession.checkSession();
  }

  function logout({ state }) {
    localGameDataFacade.removeAll();
    state.loggingOut = true;
    setTimeout(() => {
      window.location.reload();
    });
  }
};
