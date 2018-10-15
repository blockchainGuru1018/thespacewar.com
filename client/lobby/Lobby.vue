<template>
    <div class="lobby">
        <div class="users-container">
            <div class="users-header">
                <div class="users-headerTitle user-name">Name</div>
            </div>
            <div class="users">
                <div class="user">
                    <div class="user-name">{{ ownUser.name }} (you)</div>
                </div>
                <div v-for="user in users" class="user" @click="userClick(user)">
                    <span class="user-name">{{ user.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const { mapState, mapActions } = Vuex.createNamespacedHelpers('lobby');

    module.exports = {
        computed: {
            ...mapState([
                'users',
                'ownUser'
            ])
        },
        methods: {
            ...mapActions([
                'init',
                'startGameWithUser'
            ]),
            userClick(user) {
                this.startGameWithUser(user);
            }
        },
        created() {
            this.init();
        }
    };
</script>