<template>
    <button
        v-if="reallySkipDrawCardVisible"
        class="reallySkipDrawCard darkButton--onlyLook"
        @click="reallySkipDrawCard"
    >
        Really skip? ({{ count }})
    </button>
    <button
        v-else
        class="skipDrawCard darkButton--onlyLook"
        @click="showReallySkipButton"
    >
        Skip
    </button>
</template>
<script>
    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');

    module.exports = {
        data() {
            return {
                reallySkipDrawCardVisible: false,
                reallySkipDrawCardIntervalId: null,
                count: 0
            };
        },
        methods: {
            ...matchHelpers.mapActions([
                'skipDrawCard'
            ]),
            showReallySkipButton() {
                clearInterval(this.reallySkipDrawCardIntervalId);

                this.reallySkipDrawCardVisible = true;

                this.count = 5;
                this.reallySkipDrawCardIntervalId = setInterval(() => {
                    this.count -= 1;
                    if (this.count === 0) {
                        this.reallySkipDrawCardVisible = false;
                        clearInterval(this.reallySkipDrawCardIntervalId);
                    }
                }, 1000);
            },
            reallySkipDrawCard() {
                clearInterval(this.reallySkipDrawCardIntervalId);
                this.reallySkipDrawCardVisible = false;

                this.skipDrawCard();
            }
        }
    }
</script>
<style lang="scss" scoped>
    .reallySkipDrawCard,
    .skipDrawCard {
        padding: 8px 16px;
        margin-left: 40px;
        position: relative;
        top: 3px;

        transition: opacity .15s ease-in;
        opacity: .5;

        &:hover {
            background: black;
            opacity: 1;
        }
    }

    .reallySkipDrawCard {
        opacity: 1;

        &:hover {
            background: red;
            color: white;
        }
    }
</style>
