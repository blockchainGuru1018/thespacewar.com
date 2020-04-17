<template>
    <div class="game-option">
        <div class="btn btn-login">
            <a href="https://thespacewar.com/login">Login</a>
        </div>
        <div class="btn btn-register">
            <a href="https://thespacewar.com/register">Register</a>
        </div>
        <hr>
        <button class="btn btn-guest" v-on:click="enterAsGuest">Guest</button>
    </div>
</template>

<script>
    const Vuex = require('vuex');
    const loginHelpers = Vuex.createNamespacedHelpers('login');
    const User = require('../../shared/user/User.js');
    const {uniqueNamesGenerator, adjectives, colors, animals, names} = require('unique-names-generator');

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
            }
        },
        methods: {
            ...loginHelpers.mapActions([
                'login'
            ]),
            enterAsGuest() {
                this.username = this.genericUsername();
                this.login(this.username)
            },
            genericUsername() {
                return uniqueNamesGenerator({
                    dictionaries: [adjectives, colors, names], // colors can be omitted here as not used
                    length: 2
                });
            }
        }
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
                cursor: pointer;
                clear: both;
                background-color: #0b0b0ba6;
                border: 0;
                width: 100%;
                margin: 0;
                padding: 3px 0;
                display: block;

                &:hover {
                    color: #dfdfdf;
                    background-color: #222422;
                }
            }
        }
    }
</style>