<template>
    <div class="game-option">
        <div class="btn btn-login">
            <a :href="loginUrl">Login</a>
        </div>
        <div class="btn btn-register">
            <a href="https://thespacewar.com/register">Register</a>
        </div>
        <hr>
        <button
            v-if="playAsGuestOn"
            class="btn btn-guest"
            @click="playAgainstAi"
        >
            Play against AI
        </button>
        <button
            v-else
            class="btn btn-guest"
            :disabled="true"
        >
            Play against AI (coming soon)
        </button>
    </div>
</template>

<script>
    import featureToggles from "../utils/featureToggles";

    const Vuex = require('vuex');
    const loginHelpers = Vuex.createNamespacedHelpers('login');
    const guestHelpers = Vuex.createNamespacedHelpers('guest');
    const User = require('../../shared/user/User.js');
    const {uniqueNamesGenerator, adjectives, colors, names} = require('unique-names-generator');

    export default {
        name: "StartGameOption",
        computed: {
            username: {
                get() {
                    return this.genericUsername();
                },
                set(username) {
                    this.$store.state.login.username = username;
                }
            },
            usernameMaxLength() {
                return User.MaxNameLength;
            },
            loginUrl() {
                if (runningInLocalDevelopmentEnvironment()) {
                    return 'http://localhost:8081/fake-login';
                } else {
                    return 'https://thespacewar.com/login';
                }
            },
            playAsGuestOn() {
                return true;
                //return featureToggles.isEnabled('playAsGuest');
            }
        },
        methods: {
            ...loginHelpers.mapActions([
                'login'
            ]),
            ...guestHelpers.mapActions([
                'playAgainstAi'
            ]),
            genericUsername() {
                return uniqueNamesGenerator({
                    dictionaries: [adjectives, colors, names], // colors can be omitted here as not used
                    length: 2
                });
            }
        }
    }

    function runningInLocalDevelopmentEnvironment() {
        return window.location.hostname === 'localhost';
    }
</script>

<style scoped lang="scss">
    @import "../client/match/_colors.scss";

    .view-wrapper {
        display: block !important;
    }

    .game-option {
        position: relative;
        z-index: 2;
        text-align: center;

        hr {
            border-bottom: 3px solid #fff;
            border-top: none;
            border-right: none;
            border-left: none;
        }

        .btn {
            font-family: "Space Mono", monospace;
            font-size: 1em;
            display: inline-block;
            margin: 0 4px;
            color: $linkWhite;

            a {
                color: $linkWhite;
            }

            &.btn-login {
            }

            &.btn-login {

            }

            &.btn-guest {
                clear: both;
                background-color: #0b0b0ba6;
                border: 0;
                width: 100%;
                margin: 0;
                padding: 3px 6px;
                display: block;

                &:hover:not(:disabled) {
                    color: #dfdfdf;
                    background-color: #222422;
                    cursor: pointer;
                }

                &:disabled {
                    color: #999;
                }
            }
        }
    }
</style>