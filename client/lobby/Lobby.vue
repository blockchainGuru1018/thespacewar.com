<template>
    <div class="lobby" v-if="ownUser">
        <!--<div class="lobby-loggingOut">-->
        <!--</div>-->
        <div class="users-container">
            <div class="users-header">
                <div class="users-headerTitle">Users</div>
            </div>
            <div class="users">
                <div class="user">
                    <div class="user-name">{{ ownUser.name }} (you)</div>
                    <!--<button @click="logout" class="icon-logout"/>-->
                </div>
                <div v-for="user in otherUsers"
                     @keydown.enter="userClick(user)"
                     @click="userClick(user)"
                     class="user"
                     tabindex="0">
                    <span class="user-name">{{ user.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const { mapActions } = Vuex.createNamespacedHelpers('lobby');
    const userHelpers = Vuex.createNamespacedHelpers('user');
    const lobbyHelpers = Vuex.createNamespacedHelpers('lobby');

    module.exports = {
        computed: {
            ...userHelpers.mapState([
                'users',
                'ownUser'
            ]),
            ...lobbyHelpers.mapState([
                'loggingOut'
            ]),
            otherUsers() {
                return this.users.filter(u => u.id !== this.ownUser.id);
            }
        },
        methods: {
            ...mapActions([
                'startGameWithUser'
            ]),
            userClick(user) {
                this.startGameWithUser(user);
            },
            logout() {
            }
        }
    };
</script>
<style scoped lang="scss">

    .users-headerTitle {
        font-size: 16px;
        color: white;
        font-family: "Space Mono", monospace;
        position: relative;
        left: 5px;
    }

    .users {
        width: 300px;
        background: rgba(0, 0, 0, .4);
        box-shadow: 1px 1px 1px rgba(0, 0, 0, .1);
    }

    .user {
        font-family: "Space Mono", monospace;
        font-size: 20px;
        color: white;
        margin-bottom: 4px;
        padding: 4px 6px;

        &:hover, &:focus {
            background: rgba(0, 0, 0, .7);
            cursor: pointer;
        }
    }
</style>