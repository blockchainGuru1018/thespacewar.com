<template>
    <div :class="['loading', {'loading--done': loadingDone}]">
        <div class="loading-backdropLetterBoxWrapper">
            <div class="background" />
        </div>
        <div
            v-if="!loadingDone"
            class="loading-bar"
        >
            <div
                :style="progressStyle"
                class="loading-barProgress"
            />
        </div>
        <Lobby
            v-if="!!ownUser && loadingDone"
            :class="viewClasses"
        />
        <Login
            v-else-if="hasAccess"
            :class="viewClasses"
        />
        <EnterAccessKey
            :class="viewClasses"
            v-else
        />
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const loadingHelpers = Vuex.createNamespacedHelpers('loading');
    const userHelpers = Vuex.createNamespacedHelpers('user');
    const loginHelpers = Vuex.createNamespacedHelpers('login');
    const resolveModuleWithPossibleDefault = require('../utils/resolveModuleWithPossibleDefault.js');
    const Lobby = resolveModuleWithPossibleDefault(require('../lobby/Lobby.vue'));
    const Login = resolveModuleWithPossibleDefault(require('../login/Login.vue'));
    const EnterAccessKey = resolveModuleWithPossibleDefault(require('../login/EnterAccessKey.vue'));

    module.exports = {
        computed: {
            ...loadingHelpers.mapState([
                'progress'
            ]),
            ...loadingHelpers.mapGetters([
                'loadingDone'
            ]),
            ...userHelpers.mapState([
                'ownUser'
            ]),
            ...loginHelpers.mapState([
                'hasAccess'
            ]),
            backdropClasses() {
                let classes = ['loading-backdrop'];
                if (this.loadingDone) {
                    classes.push('loading-backdrop--blur');
                    classes.push('loading-backdrop--animate');
                }
                return classes;
            },
            progressStyle() {
                const progress = Math.max(0, Math.min(100, this.progress));
                return {
                    width: `${progress}%`
                }
            },
            viewClasses() {
                let classes = ['view-wrapper'];
                if (this.loadingDone) {
                    classes.push('view-wrapper--visible');
                }
                return classes;
            }
        },
        methods: {
            async requestFullScreen() {
                try {
                    await document.documentElement.requestFullscreen();
                }
                catch (error) {
                    console.log('Got error when requested fullscreen:', error);
                }
            },
        },
        async mounted() {
            this.$store.dispatch('audio/main');

            document.addEventListener('click', this.requestFullScreen, { once: true });
            document.addEventListener('keydown', this.requestFullScreen, { once: true });
        },
        components: {
            Lobby,
            Login,
            EnterAccessKey
        }
    };
</script>
<style scoped lang="scss">
    $animation-time: 1s;
    $animation-curve: ease;

    .loading-backdropLetterBoxWrapper {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: black;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        overflow: hidden;
    }

    .background {
        width: 100%;
        height: 100%;
        background-image: url(https://uploads.staticjw.com/th/thespacewar/the-space-war-card-game.jpg);
        background-repeat: no-repeat;
        background-position: top center;
        background-size: cover;
    }

    .loading-bar {
        position: fixed;
        bottom: 35px;

        transform: translateX(-50%);
        left: 50%;

        width: 400px;
        height: 14px;
    }

    .loading-barProgress {
        background-color: rgba(255, 255, 255, .8);
        height: 100%;
    }

    .view-wrapper {
        transition: opacity $animation-time $animation-curve;
        opacity: 0;
        z-index: 1;
        position: fixed;
        transform: translate(-50%, -50%);
        left: 50%;
        top: 50%;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .view-wrapper--visible {
        opacity: 1;
    }
</style>
