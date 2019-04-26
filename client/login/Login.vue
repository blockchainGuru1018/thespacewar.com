<template>
    <div class="login">
        <input @keydown.exact.enter="loginClick"
            class="login-username"
            placeholder="username"
            v-model="username"/>
        <button :style="{opacity: username.length >= 3 ? 1 : 0}" @click="loginClick" class="login-submit">></button>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const loginHelpers = Vuex.createNamespacedHelpers('login');

    module.exports = {
        computed: {
            username: {
                get() {
                    return this.$store.state.login.username;
                },
                set(username) {
                    this.$store.state.login.username = username;
                }
            },
        },
        methods: {
            ...loginHelpers.mapActions([
                'login'
            ]),
            loginClick() {
                if (this.username.length > 0) {
                    this.login(this.username);
                }
            },
            keydown(event) {
                if (!event.altKey) return;

                if (event.code === 'Digit1') {
                    this.username = 'Mr.A';
                    this.loginClick();
                }
                else if (event.code === 'Digit2') {
                    this.username = 'Mr.B';
                    this.loginClick();

                    setTimeout(() => {
                        document.querySelectorAll('.user')[1].click();
                    }, 800);
                }
            }
        },
        mounted() {
            window.addEventListener('keydown', this.keydown);
        },
        destroyed() {
            window.removeEventListener('keydown', this.keydown);
        }
    };
</script>
<style scoped lang="scss">
    .login-username {
        font-family: "Space Mono", monospace;
        font-size: 20px;
        background: rgba(0, 0, 0, .4);
        color: white;
        display: block;
        border: 0;
        padding: 4px;

        &:hover, &:active, &:focus {
            outline: 1px solid white;
        }
    }

    .login-submit {
        font-family: "Space Mono", monospace;
        display: block;
        margin-left: 10px;
        font-size: 20px;
        padding: 4px 12px;
        background: rgba(0, 0, 0, .4);
        border: none;
        color: white;
        outline: 0;
        box-sizing: border-box;

        &:hover, &:focus {
            outline: 1px solid white;
            position: relative;
        }

        &:active {
            color: white;
            background: black;
            outline: 1px solid white;
        }
    }
</style>
