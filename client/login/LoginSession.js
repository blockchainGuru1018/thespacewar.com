import { restore } from "sinon";

export function LoginSession({
  resetLocallyStoredUserData,
  login,
  restoreOngoingMatch,
}) {
  return {
    checkAll,
  };

  async function checkAll({
    loggedInToHome,
    loggedInToGame,
    guestModeOn,
    hasOngoingMatch,
  }) {
    if (!loggedInToHome) {
      if (guestModeOn) {
        restoreOngoingMatch();
      } else {
        resetLocallyStoredUserData();
      }
    } else if (loggedInToGame) {
      // User is logged in to the PHP server (home) AND the Node server (game)
      if (guestModeOn) {
        // When the user has logged in as GUEST, and THEN wants to login as a REAL USER, we need to REMOVE THE GUEST DATA.
        resetLocallyStoredUserData();
        await login();
      } else if (hasOngoingMatch) {
        // If the user is already in a match, we need to resume that match
        restoreOngoingMatch();
      }
    } else {
      // The user is logged in to the PHP server (home), but is NOT logged in to the Node server (game), need to login as a NEW USER (new user in Node server (game), NOT new user in PHP server (home)).
      resetLocallyStoredUserData();
      await login();
    }
  }
}
