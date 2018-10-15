<template>
    <div class="login">
        <div class="login-inputWrapper">
            <input v-model="username" placeholder="Username"/>
            <button @click="loginClick">Login</button>
        </div>
    </div>
</template>
<script>
    module.exports = {
        data() {
            return {
                username: ''
            };
        },
        methods: {
            loginClick() {
                this.$emit('submit', this.username);
            }
        }
    };
</script>