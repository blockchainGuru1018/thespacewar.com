const BotId = "BOT";
const MatchMaxAliveTime = 60 * 60 * 1000;

module.exports = function ({
  userRepository,
  socketRepository,
  matchFactory,
  logger,
  fridge,
}) {
  const matchById = new Map();
  const matchByUserId = new Map();
  const matchInvitations = new Map();
  return {
    invitePlayerToGame,
    create,
    createWithBot,
    reconnect,
    reconnectBot,
    getById,
    getForUser,
    clearOldMatches,
    storeAll,
    restoreAll,
    hasSomeMatchInProgress,
    _deleteAll,
    declineInvitation,
    clearInvitations,
    acceptInvitation,
  };

  function clearInvitations(user) {
    let playerInvitations = matchInvitations.get(user.id);
    if (playerInvitations) {
      playerInvitations.forEach(({ from, to }) => {
        if (to !== user.id) {
          updateInvitation(from, to, (invitation) => invitation.from !== from);
        } else {
          updateInvitation(to, from, (invitation) => invitation.to !== to);
        }
      });
    }
    matchInvitations.delete(user.id);
  }

  function updateInvitation(opponentId, playerId, filter) {
    const invitations = matchInvitations.get(playerId) || [];
    const filteredInvitations = invitations.filter(filter);

    matchInvitations.set(playerId, filteredInvitations);

    const playerSocket = socketRepository.getForUser(playerId);
    playerSocket.emit("match/invitation", filteredInvitations);
  }

  async function invitePlayerToGame(playerId, opponentId) {
    console.log(`${playerId} invited ${opponentId} to a game`);

    if (getForUser(playerId)) {
      throw new Error("Player is already in a match: " + playerId);
    }

    if (getForUser(opponentId)) {
      throw new Error("Player is already in a match: " + opponentId);
    }

    const invitation = {
      from: playerId,
      to: opponentId,
      timeStamp: Date.now(),
    };
    let opponentInvitations = matchInvitations.get(opponentId) || [];
    let playerInvitations = [invitation];

    opponentInvitations = opponentInvitations.filter(
      (invitation) => invitation.from !== playerId
    );

    opponentInvitations.push(invitation);

    matchInvitations.set(opponentId, opponentInvitations);
    matchInvitations.set(playerId, playerInvitations);

    const opponentSocket = socketRepository.getForUser(opponentId);
    opponentSocket.emit("match/invitation", opponentInvitations);

    const playerSocket = socketRepository.getForUser(playerId);
    playerSocket.emit("match/invitation", playerInvitations);
  }

  async function declineInvitation(playerId, opponentId) {
    console.log(`${playerId} has decline ${opponentId} invitation`);

    let playerInvitations = matchInvitations.get(playerId) || [];

    playerInvitations = playerInvitations.filter(
      (invitation) => invitation.from !== opponentId
    );

    matchInvitations.set(opponentId, []);
    matchInvitations.set(playerId, playerInvitations);

    if (!socketRepository.hasConnectionToUser(playerId)) {
      throw new Error("Player is not connected: " + playerId);
    }

    if (!socketRepository.hasConnectionToUser(opponentId)) {
      throw new Error("Player is not connected: " + opponentId);
    }

    const opponentSocket = socketRepository.getForUser(opponentId);
    opponentSocket.emit("match/invitation", []);

    const playerSocket = socketRepository.getForUser(playerId);
    playerSocket.emit("match/invitation", playerInvitations);
  }

  async function acceptInvitation({ playerId, opponentId }) {
    if (!existMatchInvitation(playerId, opponentId)) {
      throw new Error("Invalid invitation");
    }

    const opponentSocket = socketRepository.getForUser(opponentId);
    opponentSocket.emit("match/invitation", []);
    matchInvitations.set(opponentId, []);

    const playerSocket = socketRepository.getForUser(playerId);
    playerSocket.emit("match/invitation", []);
    matchInvitations.set(playerId, []);

    return await create({ playerId, opponentId });
  }

  async function create({ playerId, opponentId }) {
    const match = await createForPlayers({
      playerIds: [playerId, opponentId],
      emitMatchCreateEventTo: [opponentId],
    });
    return match.toClientModel();
  }

  function existMatchInvitation(playerId, opponentId) {
    const playerInvitations = matchInvitations.get(opponentId) || [];

    return playerInvitations.some((invitation) => invitation.to === playerId);
  }
  async function createForPlayers({
    playerIds,
    emitMatchCreateEventTo = null,
  }) {
    for (const playerId of playerIds) {
      if (!socketRepository.hasConnectionToUser(playerId)) {
        throw new Error("Player is not connected: " + playerId);
      }
      if (getForUser(playerId)) {
        throw new Error("Player is already in a match: " + playerId);
      }
    }

    const users = await getUsers(playerIds);
    if (users.some((u) => u === null))
      throw new Error("Some users for the match does not exist");

    const match = matchFactory.create({ users, endMatch });
    registerMatchWithUsers(match, users);

    const emitToPlayers = emitMatchCreateEventTo
      ? emitMatchCreateEventTo
      : playerIds;
    for (const playerId of emitToPlayers) {
      emitMatchCreate(match, playerId);
    }

    return match;
  }

  async function createWithBot({ playerId }) {
    if (getForUser(playerId)) {
      throw new Error("Player is already in a match");
    }

    const user = await userRepository.getUser(playerId);
    if (!user) throw new Error("Some users for the match does not exist");

    const match = matchFactory.createWithBot({ user, endMatch });
    registerMatchWithUsers(match, [user]);

    return match.toClientModel();
  }

  async function reconnect({ playerId, matchId }) {
    const match = getForUser(playerId);
    if (!match) throw new Error("Cannot find match for player");

    await updatePlayerMatchConnection(playerId, matchId);
    registerUserEnteredMatch(playerId);
  }

  async function reconnectBot({ playerId, matchId }) {
    const match = getForUser(playerId);
    if (!match) throw new Error("Cannot find match for player");

    await updateBotMatchConnection(playerId, BotId, matchId);
  }

  function getById(id) {
    return matchById.get(id) || null;
  }

  function getForUser(userId) {
    return matchByUserId.get(userId);
  }

  function clearOldMatches() {
    const matchIdsToClear = [];
    matchById.forEach((match, matchId) => {
      if (match.timeAlive() > MatchMaxAliveTime) {
        matchIdsToClear.push(matchId);
      }
    });
    matchIdsToClear.forEach((matchId) => endMatch(matchId));
  }

  function storeAll() {
    const matches = Array.from(matchById.values());
    fridge.putIn(
      matches.map((match) => {
        return {
          restorableState: match.getRestorableState(),
          playerIds: match.playerIds(),
        };
      })
    );
  }

  async function restoreAll() {
    const restorableMatches = fridge.takeOutAll();
    for (const restorableMatchInfo of restorableMatches) {
      const match = await createForPlayers({
        playerIds: restorableMatchInfo.playerIds,
      });
      match.restoreFromRestorableState(restorableMatchInfo.restorableState);
    }
  }

  function hasSomeMatchInProgress() {
    clearOldMatches();

    return matchById.size > 0;
  }

  function _deleteAll() {
    matchById.clear();
    matchByUserId.clear();
  }

  function endMatch(matchId) {
    const userIdsWithMatchRegistered = getMatchUserIds(matchId);
    for (const userId of userIdsWithMatchRegistered) {
      registerUserExitedMatch(userId);
      matchByUserId.delete(userId);
    }

    matchById.delete(matchId);
  }

  function getMatchUserIds(matchId) {
    const userIds = [];
    matchByUserId.forEach((match, userId) => {
      if (match.id === matchId) {
        userIds.push(userId);
      }
    });

    return userIds;
  }

  async function updatePlayerMatchConnection(playerId, matchId) {
    const match = await getById(matchId);
    const connection = socketRepository.getForUser(playerId);
    match.updatePlayer(playerId, { connection });
  }

  async function updateBotMatchConnection(playerId, botId, matchId) {
    const match = await getById(matchId);
    const connection = socketRepository.getForUser(playerId);
    match.updatePlayer(botId, { connection });
  }

  function getUsers(userIds) {
    return Promise.all(userIds.map((id) => userRepository.getUser(id)));
  }

  function emitMatchCreate(match, userId) {
    const opponentSocket = socketRepository.getForUser(userId);
    try {
      opponentSocket.emit("match/create", match.toClientModel());
    } catch (error) {
      logger.log(
        `Disconnected user - Tried to emit to user that has disconnected (matchId:${match.id}, userId:${userId})`,
        "match"
      );
      logger.log(
        `RAW ERROR while trying to connect to player: ${error.message}`,
        "match"
      );
    }
  }

  function registerMatchWithUsers(match, users) {
    matchById.set(match.id, match);

    for (const user of users) {
      const userId = user.id;
      matchByUserId.set(userId, match);
      registerUserEnteredMatch(userId);
    }
  }

  function registerUserEnteredMatch(userId) {
    userRepository.updateUser(userId, (user) => {
      user.enteredMatch();
    });
  }

  function registerUserExitedMatch(userId) {
    userRepository.updateUser(userId, (user) => {
      user.exitedMatch();
    });
  }
};
