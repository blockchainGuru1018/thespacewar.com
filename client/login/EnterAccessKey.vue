<template>
    <div class="enterAccessKey">
        <input
            :class="['enterAccessKey-accessKey', {'enterAccessKey-accessKey--wrong': enteredWrongAccessKey}]"
            @keydown.exact.enter="enterAccessKeyClick"
            placeholder="Access key"
            v-model="accessKey"
        />
        <button
            :style="{opacity: accessKey.length >= 1 ? 1 : 0}"
            @click="enterAccessKeyClick"
            class="enterAccessKey-submit"
        >
            >
        </button>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const loginHelpers = Vuex.createNamespacedHelpers('login');

    module.exports = {
        data() {
            return {
                accessKey: ''
            };
        },
        computed: {
            ...loginHelpers.mapState([
                'enteredWrongAccessKey'
            ])
        },
        methods: {
            ...loginHelpers.mapActions([
                'testAccessKey'
            ]),
            async enterAccessKeyClick() {
                if (this.accessKey.length > 0) {
                    await this.testAccessKey(this.accessKey);
                    this.accessKey = '';
                }
            }
        }
    };
</script>
<style lang="scss" scoped>
    .enterAccessKey-accessKey {
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

        &.enterAccessKey-accessKey--wrong {
            border: 2px solid red;
        }
    }

    .enterAccessKey-submit {
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
