<template>
  <div v-if="ownUser" class="lobby">
    <div class="lobby-userAccountPageLinkDiv">
      <a
        href="https://thespacewar.com/account"
        class="lobby-userAccountPageLink"
      >&#8592; Back to Account</a
      >
    </div>
    <div class="users-container">
      <div class="row">
        <SelectDeck />
        <ProfileUserPlayer />
        <div class="list-opponents">
          <div class="users-header">
            <div class="users-headerTitle">
              Select opponent
            </div>
          </div>
          <div class="users-wrapper">
            <div class="users">
              <div
                tabindex="0"
                class="user"
                @click="startGameWithBot"
                @keydown.enter="startGameWithBot"
              >
                <span class="user-name">Mr.Roboto</span>
              </div>
              <div
                v-if="availableUsers.length === 0"
                class="users-noUsersAvailable"
              >
                None available
              </div>
              <template v-else>
                <div
                  v-for="user in availableUsers"
                  :key="user.id"
                  tabindex="0"
                  class="user"
                  @click="userClick(user)"
                  @keydown.enter="userClick(user)"
                >
                  <span class="user-name">
                    {{ user.name }}
                  </span>
                  <Flag :country="user.country" />
                  <span class="user-rating">
                    {{ user.rating }}
                  </span>
                </div>
              </template>

              <div class="users-sectionHeader">
                {{ usersInGameCount }} users playing
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmationDialog v-if="currentInvitations.length > 0">
      <template slot="header">
        <div class="confirmDialogHeader"></div>
      </template>
      <template slot="body">
        <div class="confirmDialogContent">
          <p>
            {{ invitationMessage() }}
          </p>
        </div>
      </template>
      <template slot="footer">
        <div class="slot-footer-container">
          <div class="separator20Percent" />
          <div
            v-if="currentInvitations[0].to === ownUser.id"
            class="confirmBoxOption"
          >
            <span
              class="marginLeft10"
              @click="acceptInvitationClick(currentInvitations[0].from)"
            >
              Yes
            </span>
          </div>
          <div class="separator30Percent" />
          <div
            v-if="currentInvitations[0].to === ownUser.id"
            class="confirmBoxOption confirmDialogCenterButton"
          >
            <span
              class="'marginRight10'"
              @click="declineInvitationClick(currentInvitations[0].from)"
            >
              No
            </span>
          </div>
          <div
            v-if="currentInvitations[0].from === ownUser.id"
            class="confirmBoxOption confirmDialogCenterButton"
          >
            <span
              class="'marginRight10'"
              @click="cancelInvitationClick(currentInvitations[0].to)"
            >
              Cancel
            </span>
          </div>
        </div>
      </template>
    </ConfirmationDialog>
  </div>
</template>
<script>
import Flag from "./Flag.vue";
import ProfileUserPlayer from "./ProfileUserPlayer.vue";
import SelectDeck from "./SelectDeck.vue";
import featureToggles from "../utils/featureToggles.js";
import ConfirmationDialog from "../match/ConfirmationDialog.vue";

export default {
  components: { SelectDeck },
};
const Vuex = require("vuex");
const { mapActions, mapGetters } = Vuex.createNamespacedHelpers("lobby");
const userHelpers = Vuex.createNamespacedHelpers("user");
const lobbyHelpers = Vuex.createNamespacedHelpers("lobby");

module.exports = {
  computed: {
    ...userHelpers.mapState(["users", "ownUser"]),
    ...mapGetters(["currentInvitations"]),
    ...lobbyHelpers.mapState([
      "loggingOut", //TODO Fully implement logout functionality or remove the traces of it that's left
    ]),
    otherUsers() {
      return this.users
        .filter((u) => u.isConnected)
        .filter((u) => u.id !== this.ownUser.id);
    },
    usersInGameCount() {
      return this.otherUsers.filter((u) => u.inMatch).length;
    },
    availableUsers() {
      return this.otherUsers
        .filter((u) => u.allowedInLobby)
        .filter((u) => !u.inMatch);
    },
  },
  methods: {
    ...mapActions([
      "startGameWithUser",
      "acceptInvitation",
      "invitePlayerToGame",
      "declineInvitation",
      "startGameWithBot",
      "showProfileUserPlayer",
      "cancelInvitation",
    ]),
    playerName(playerId) {
      const opponentUser = this.otherUsers.find((u) => u.id === playerId);
      if (opponentUser) {
        return opponentUser.name;
      }
    },
    invitationMessage() {
      const invitation = this.currentInvitations[0];
      if (this.ownUser.id === invitation.from) {
        return `Waiting for ${this.playerName(
          invitation.to
        )} to accept the challenge.`;
      } else {
        return `Do you accept the challenge to play versus ${this.playerName(
          invitation.from
        )} ?`;
      }
    },
    userClick(user) {
      this.invitePlayerToGame(user);
    },
    declineInvitationClick(opponentId) {
      const opponentUser = this.otherUsers.find((u) => u.id === opponentId);
      this.declineInvitation(opponentUser);
    },
    cancelInvitationClick(opponentId) {
      const opponentUser = this.otherUsers.find((u) => u.id === opponentId);
      this.cancelInvitation(opponentUser);
    },
    acceptInvitationClick(opponentId) {
      const opponentUser = this.otherUsers.find((u) => u.id === opponentId);
      this.acceptInvitation(opponentUser);
    },
  },
  components: { Flag, ProfileUserPlayer, SelectDeck, ConfirmationDialog },
};
</script>
<style scoped lang="scss">
.lobby {
  width: 100%;
  min-height: 740px;
}

@media (max-height: 800px) {
  .lobby { top 0px; }
}

.users-container {
  background: url(https://images.thespacewar.com/metal-corner.png) right bottom
      no-repeat,
    url(https://images.thespacewar.com/frame-bg-lobby.png) right bottom
      no-repeat;
  width: 100%;
  max-width: 500px;
  position: absolute;
  right: 0px;
  top: 0px;
  height: 100%;

  .row {
    margin-top: 75px;
    margin-left: 60px;
    margin-right: 60px;

    .list-opponents {
      margin-left: 20px;
    }
  }
}

.confirmDialogCenterButton {
  flex: auto;
}

.slot-footer-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  align-content: space-between;
}

.marginLeft10 {
  margin-left: 10px;
}

.separator20Percent {
  width: 20%;
}

.confirmBoxOption {
  width: 15%;
  display: flex;
  text-align: center;
  justify-content: center;
  font-size: x-large;

  span {
    cursor: pointer;

    &:hover {
      color: red;
      transition: 0.5s;
    }
  }
}

.separator30Percent {
  width: 30%;
}

.users-headerTitle {
  font-size: 16px;
  color: white;
  font-family: "Space Mono", monospace;
  position: relative;
  left: 5px;
}

.users-wrapper {
  // background: rgba(0, 0, 0, .7);
  // box-shadow: 0px -10px 90px 100px rgba(0, 0, 0, .7);
  // border-radius: 50%;
}

.users {
  width: 100%;
  // background: rgba(0, 0, 0, .4);
  // box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  border-radius: 0;
  // border: 1px solid rgba(255, 255, 255, .04);
}

.users-noUsersAvailable {
  margin-top: 10px;
  margin-bottom: 10px;
  font-family: "Space Mono", monospace;
  font-size: 20px;
  color: white;
  text-align: center;
}

.users-sectionHeader {
  margin-top: 30px;
  margin-bottom: 10px;
  font-family: "Space Mono", monospace;
  font-size: 14px;
  color: rgb(120, 120, 120);
  text-align: center;
}

.user {
  display: flex;
  align-items: center;
  font-family: "Space Mono", monospace;
  font-size: 20px;
  color: white;
  padding: 4px 10px 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  &:hover,
  &:focus {
    background: rgba(0, 0, 0, 0.7);
    cursor: pointer;
  }
}

.user-rating {
  margin-left: auto;
  color: #777;
}

.user--inMatch {
  color: rgb(120, 120, 120);
  pointer-events: none;
}

.inGame {
  display: inline-block;
  padding-left: 5px;
  font-size: 0.7em;
  letter-spacing: 0.2em;
}

.lobby-userAccountPageLink {
  color: white;
  font-family: "Space Mono", inherit monospace;
  font-size: 1em;
  z-index: 10;
  text-decoration: none;
  font-weight: bold;
}

.lobby-userAccountPageLinkDiv {
  position: fixed;
  left: 10px;
  top: 5px;
}
</style>
