<template>
    <div :class="['loading', {'loading--done': loadingDone}]">
        <div class="loading-backdropLetterBoxWrapper">
            <img
                :class="backdropClasses"
                src="https://uploads.staticjw.com/th/thespacewar/the-space-war-card-game.jpg"
                alt="Small fighters attacking a large battleship"
            >
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
        mounted() {
            this.$store.dispatch('audio/main');
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
    }

    .loading-backdrop {
        width: 100%;
        transition: filter $animation-time $animation-curve, transform 240s, left 240s;

        left: -10px;
        transform: scale(1.05, 1.025);
    }

    .loading-backdrop--blur {
        /*filter: brightness(.9) contrast(105%) blur(3px);*/
        filter: brightness(.9) contrast(105%) blur(.1px);
    }

    .loading-backdrop--animate {
        left: 20px;
        transform: scale(1, 1);
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
