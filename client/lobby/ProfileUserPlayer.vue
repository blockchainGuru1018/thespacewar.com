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
        // background-color: #0000007d;
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
