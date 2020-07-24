import { LoginSession } from "../login/LoginSession";

describe("User logged in to Home", () => {
  describe("They should be logged in to the game as a regular user", () => {
    test("when logged in to Home but NOT logged in to Game, should reset local user", async () => {
      const resetLocallyStoredUserData = jest.fn();
      const session = createLoginSession({ resetLocallyStoredUserData });

      await session.checkAll({
        loggedInToHome: true,
        loggedInToGame: false,
      });

      expect(resetLocallyStoredUserData).toHaveBeenCalled();
    });

    test("when logged in to Home but NOT logged in to Game, should login to Game", async () => {
      const login = jest.fn();
      const session = createLoginSession({ login });

      await session.checkAll({
        loggedInToHome: true,
        loggedInToGame: false,
      });

      expect(login).toHaveBeenCalled();
    });
  });
});

describe("User NOT logged in to Home", () => {
  test("They should lose their account attached to Game", async () => {
    const resetLocallyStoredUserData = jest.fn();
    const session = createLoginSession({ resetLocallyStoredUserData });

    await session.checkAll({
      loggedInToHome: false,
      loggedInToGame: false,
      guestModeOn: false,
    });

    expect(resetLocallyStoredUserData).toHaveBeenCalled();
  });
});

describe("User in Guest mode", () => {
  test(`They should keep their Guest account`, async () => {
    const resetLocallyStoredUserData = jest.fn();
    const session = createLoginSession({ resetLocallyStoredUserData });

    await session.checkAll({
      loggedInToHome: false,
      loggedInToGame: true,
      guestModeOn: true,
    });

    expect(resetLocallyStoredUserData).not.toHaveBeenCalled();
  });

  test(`They should be put back into their game`, async () => {
    const restoreOngoingMatch = jest.fn();
    const session = createLoginSession({ restoreOngoingMatch });

    await session.checkAll({
      loggedInToHome: false,
      loggedInToGame: true,
      guestModeOn: true,
    });

    expect(restoreOngoingMatch).toHaveBeenCalled();
  });

  describe("They should lose their Guest account after they have logged in to Home", () => {
    test("when logged in to Home and to Game BUT Guest mode is on, should reset local user", async () => {
      const resetLocallyStoredUserData = jest.fn();
      const session = createLoginSession({ resetLocallyStoredUserData });

      await session.checkAll({
        loggedInToHome: true,
        loggedInToGame: true,
        guestModeOn: true,
      });

      expect(resetLocallyStoredUserData).toHaveBeenCalled();
    });

    test("when logged in to Home and to Game BUT Guest mode is on, should login to Game", async () => {
      const login = jest.fn();
      const session = createLoginSession({ login });

      await session.checkAll({
        loggedInToHome: true,
        loggedInToGame: true,
        guestModeOn: true,
      });

      expect(login).toHaveBeenCalled();
    });
  });
});

describe("User logged in to Home and Game", () => {
  test("when has previous game session should restore it", async () => {
    const restoreOngoingMatch = jest.fn();
    const session = createLoginSession({ restoreOngoingMatch });

    await session.checkAll({
      loggedInToHome: true,
      loggedInToGame: true,
      hasOngoingMatch: true,
    });

    expect(restoreOngoingMatch).toHaveBeenCalled();
  });

  test("when does NOT have an ongoing match should NOT try to restore some match", async () => {
    const restoreOngoingMatch = jest.fn();
    const session = createLoginSession({ restoreOngoingMatch });

    await session.checkAll({
      loggedInToHome: true,
      loggedInToGame: true,
      hasOngoingMatch: false,
    });

    expect(restoreOngoingMatch).not.toHaveBeenCalled();
  });
});

function createLoginSession(deps = {}) {
  return LoginSession({
    login: () => {},
    resetLocallyStoredUserData: () => {},
    restoreOngoingMatch: () => {},
    ...deps,
  });
}
