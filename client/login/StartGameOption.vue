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
    export default {
        name: "StartGameOption",
        methods: {
            enterAsGuest() {
                alert('Guest User')
            }
        }
    }
</script>

<style scoped lang="scss">
    .game-option {
        position: relative;
        z-index: 2;
        .btn {
            font-family: "Space Mono", monospace;
            font-size: 0.4em;
            display: inline-block;
            margin: 0 4px;
            .btn-login {

            }
            .btn-login {

            }
        }
    }
</style>