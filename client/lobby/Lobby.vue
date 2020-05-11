<template>
    <div v-if="ownUser" class="lobby">
        <div class="users-container">
          <div class="row">
            <ProfileUserPlayer/>
            <div class="list-opponents">
              <div class="users-header">
                  <div class="users-headerTitle">
                      Select opponent
                  </div>
              </div>
              <div class="users-wrapper">
                  <div class="users">
                      <div tabindex="0" class="user" @click="startGameWithBot" @keydown.enter="startGameWithBot">
                          <span class="user-name">
                              Mr.Roboto
                          </span>
                      </div>
                      <div v-if="availableUsers.length === 0" class="users-noUsersAvailable">
                          None available
                      </div>
                      <template v-else>
                          <div v-for="user in availableUsers" :key="user.id" tabindex="0" class="user" @click="userClick(user)" @keydown.enter="userClick(user)">
                              <span class="user-name">
                                  {{ user.name }}
                              </span>
                              <Flag :country="user.country"/>
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
    </div>
</template>
<script>
    import Flag from './Flag.vue';
    import ProfileUserPlayer from './ProfileUserPlayer.vue';

    const Vuex = require('vuex');
    const {mapActions} = Vuex.createNamespacedHelpers('lobby');
    const userHelpers = Vuex.createNamespacedHelpers('user');
    const lobbyHelpers = Vuex.createNamespacedHelpers('lobby');

    module.exports = {
        computed: {
            ...userHelpers.mapState([
                'users',
                'ownUser'
            ]),
            ...lobbyHelpers.mapState([
                'loggingOut' //TODO Fully implement logout functionality or remove the traces of it that's left
            ]),
            otherUsers() {
                return this.users
                    .filter(u => u.isConnected)
                    .filter(u => u.id !== this.ownUser.id);
            },
            usersInGameCount() {
                return this.otherUsers.filter(u => u.inMatch).length;
            },
            availableUsers() {
                return this.otherUsers
                    .filter(u => u.allowedInLobby)
                    .filter(u => !u.inMatch);
            }
        },
        methods: {
            ...mapActions([
                'startGameWithUser',
                'startGameWithBot',
                'showProfileUserPlayer'
            ]),
            userClick(user) {
                this.startGameWithUser(user);
            }
        },
        components: {Flag, ProfileUserPlayer}
    };
</script>
<style scoped lang="scss">
    .lobby{
      width: 100%;
      min-height: 740px;
    }
    .users-container{
        background: url(https://images.thespacewar.com/metal-corner.png) right bottom no-repeat,
                    url(https://images.thespacewar.com/frame-bg-lobby.png) right bottom no-repeat;
        width: 100%;
        max-width: 500px;
        position: absolute;
        right: 0px;
        top: 0px;
        height: 100%;

        .row{
          margin-top: 75px;
          margin-left: 60px;
          margin-right: 60px;
          .list-opponents{
            margin-left: 20px;
          }
        }
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
        border-bottom: 1px solid rgba(255, 255, 255, .2);

        &:hover, &:focus {
            background: rgba(0, 0, 0, .7);
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
        font-size: .7em;
        letter-spacing: .2em;
    }
</style>
