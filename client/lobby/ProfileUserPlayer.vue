<template>
    <div class="profile-user-player">
        <span class="username">[ {{user.username}} - <Flag :country="user.country"/> ]</span>
    </div>
</template>

<script>
    import Flag from './Flag.vue';
    const Vuex = require('vuex');
    const {mapActions} = Vuex.createNamespacedHelpers('lobby');
    module.exports = {
        name: "ProfileUserPlayer",
        data() {
            return {
                user: {
                    id: '',
                    username: '',
                    country: '',
                    rating: '',
                }
            }
        },
        methods: {
            ...mapActions([
                'showProfileUserPlayer'
            ])
        },
        async mounted() {
            this.user = await this.showProfileUserPlayer()
        },
        components: {Flag}
    }
</script>

<style scoped lang="scss">
    .profile-user-player {
        padding: 6px 10px;
        text-align: left;
        opacity: 1;
        background: url(https://images.thespacewar.com/corner-top-name-player.png) no-repeat top left,
                    url(https://images.thespacewar.com/corner-bottom-name-player.png) no-repeat bottom left,
                    url(https://images.thespacewar.com/corner-top-right-name-player.png) no-repeat top right,
                    url(https://images.thespacewar.com/corner-bottom-right-name-player.png) no-repeat bottom right,
                    url(https://images.thespacewar.com/name-player-bg.jpg) no-repeat center right;
        background-size: auto, auto, auto, auto, cover;
        width: 100%;
        max-width: 300px;
        margin-bottom: 15px;
        .username {
            text-transform: capitalize;
            font-size: 15px;
            color: #fff;
            font-family: "Space Mono", monospace;
        }
        .user-player {
            width: 27px;
            vertical-align: middle;
        }
    }
</style>
