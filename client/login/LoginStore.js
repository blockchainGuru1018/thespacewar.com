import { LoginSession } from "./LoginSession";

const ajax = require("../utils/ajax.js");
const localGameDataFacade = require("../utils/localGameDataFacade.js");
const createBotUser = require("../../shared/user/createBotUser.js");
const BotId = "BOT";

module.exports = function ({ route, userRepository, botUpdateListener }) {
  return {
    namespaced: true,
    name: "login",
    state: {
      username: "",
      enteredWrongAccessKey: false,
      hasAccess: false,
      _isAuthenticating: false,
    },
    getters: {
      checkIfHasPreviousSession,
      checkIfLoggedInAsGuest,
    },
    actions: {
      init,
      login,
      loginAsGuest,
      testAccessKey,
      restoreMatchFromPreviousSession,
      authenticateUserSession,
      _resetLocallyStoredUserData,
      _restorePreviousSession,
      _loadOwnUser,
    },
  };

  async function init({ state, dispatch }) {
    const storedAccessKey = localGameDataFacade.AccessKey.get();
    if (storedAccessKey) {
      state.hasAccess = true;
      dispatch("testAccessKey", storedAccessKey);
    }

    window.addEventListener("focus", async () => {
      if (!state._isAuthenticating) {
        const loggedInToHome = await isLoggedInToHome();
        if (!loggedInToHome) window.location.reload();
      }
    });
  }

  async function login({ dispatch }) {
    const ownUser = await ajax.jsonPostEmptyWithSecret("/login"); //Note: This creates a NEW login on the Node server (game)
    localGameDataFacade.setOwnUser(ownUser);
    dispatch("user/storeOwnUser", ownUser, { root: true });
  }

  async function loginAsGuest({ dispatch }) {
    const newRandomName = `Guest${Math.round(Math.random() * 9999)}`;
    const ownUser = await ajax.jsonPost("/guest-login", {
      name: newRandomName,
    });
    localGameDataFacade.setOwnUser(ownUser);
    localGameDataFacade.activateGuestMode();
    dispatch("user/storeOwnUser", ownUser, { root: true });
  }

  async function authenticateUserSession({ state, dispatch, getters }) {
    state._isAuthenticating = true;

    const [loggedInToHome, loggedInToGame] = await Promise.all([
      isLoggedInToHome(),
      isLoggedInToGame(),
    ]);

    const loginSession = LoginSession({
      resetLocallyStoredUserData: () => dispatch("_resetLocallyStoredUserData"),
      login: () => dispatch("login"),
      restoreOngoingMatch: () => dispatch("_restorePreviousSession"),
    });
    await loginSession.checkAll({
      loggedInToHome,
      loggedInToGame,
      guestModeOn: localGameDataFacade.guestModeOn(),
      hasOngoingMatch: getters["checkIfHasPreviousSession"],
    });

    state._isAuthenticating = false;
  }

  async function isLoggedInToHome() {
    const { isLoggedIn } = await ajax.get("/is-logged-in-to-home");
    return isLoggedIn;
  }

  async function isLoggedInToGame() {
    return !!localGameDataFacade.getOwnUser() && (await existsOnServer());
  }

  async function existsOnServer() {
    const ownUser = localGameDataFacade.getOwnUser();
    const allUsers = await userRepository.getAll();
    return allUsers.some((u) => u.id === ownUser.id);
  }

  async function _restorePreviousSession({ dispatch }) {
    dispatch("_loadOwnUser");
    await dispatch("login/restoreMatchFromPreviousSession", null, {
      root: true,
    });
  }

  function _loadOwnUser({ dispatch }) {
    const ownUser = localGameDataFacade.getOwnUser();
    if (ownUser) {
      dispatch("user/storeOwnUser", ownUser, { root: true });
    }
  }

  function _resetLocallyStoredUserData({ dispatch }) {
    localGameDataFacade.removeAll();
    dispatch("user/storeOwnUser", null, { root: true });
  }

  async function testAccessKey({ state }, key) {
    try {
      const result = await ajax.jsonPost("/test-access-key", { key });
      if (result.valid) {
        state.enteredWrongAccessKey = false;
        state.hasAccess = true;
        localGameDataFacade.AccessKey.set(key);
      } else {
        state.hasAccess = false;
        state.enteredWrongAccessKey = true;
        localGameDataFacade.AccessKey.remove();
      }
    } catch (error) {
      state.enteredWrongAccessKey = true;
    }
  }

  function checkIfHasPreviousSession() {
    return () => !!localGameDataFacade.getOngoingMatch();
  }

  function checkIfLoggedInAsGuest() {
    return loggedInAsGuest;
  }

  async function loggedInAsGuest() {
    const [loggedInHome, loggedInGame] = await Promise.all([
      isLoggedInToHome(),
      isLoggedInToGame(),
    ]);
    return !loggedInHome && loggedInGame;
  }

  async function restoreMatchFromPreviousSession() {
    const matchData = localGameDataFacade.getOngoingMatch();
    if (matchData) {
      const { id: matchId, playerIds } = matchData;
      if (playerIds.includes(BotId)) {
        joinBotMatch(matchId);
      } else {
        joinPlayerMatch(matchId, playerIds);
      }
    }
  }

  function joinBotMatch(matchId) {
    const botUser = createBotUser();
    route("match", { matchId, opponentUser: botUser });

    botUpdateListener.start({
      matchId,
      botUser,
      playerUser: userRepository.getOwnUser(),
    });

    userRepository.reconnectBot();
  }

  function joinPlayerMatch(matchId, playerIds) {
    const ownUserId = userRepository.getOwnUser().id;
    const opponentUserId = playerIds.find((id) => id !== ownUserId);
    const users = userRepository.getAllLocal();
    const opponentUser = users.find((u) => u.id === opponentUserId);
    route("match", { matchId, opponentUser });
  }
};
