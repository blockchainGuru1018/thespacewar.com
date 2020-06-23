<template>
    <div
            v-if="!holdingCard"
            ref="actionLog"
            :class="['actionLog', {'actionLog--collapsed': !expanded}]"
            @click="toggleExpanded"
    >
        <ActionLogEntryItem v-for="(entry,index) in entries" :key="index" :entry="entry" :expanded="expanded"/>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const cardHelpers = Vuex.createNamespacedHelpers('card');
    const actionLogHelpers = Vuex.createNamespacedHelpers('actionLog');
    const expandedCardHelpers = Vuex.createNamespacedHelpers('expandedCard');
    import ActionLogEntryItem from "./ActionLogEntryItem.vue";
    export default {
        components: {
            ActionLogEntryItem
        },
        computed: {
            ...matchHelpers.mapGetters([
                'actionLog'
            ]),
            ...cardHelpers.mapState([
                'holdingCard'
            ]),
            ...actionLogHelpers.mapState([
                'expanded'
            ]),
            entries() {
                return this.actionLog.queryLatest().slice().reverse();
            }
        },
        methods: {
            ...actionLogHelpers.mapActions([
                'toggleExpanded'
            ])
        }
    };
</script>
<style lang="scss">
    @import "../banner/banner";

    $borderSize: 2px;

    .actionLog {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 3;

        margin: #{$bannerTopMargin + $bannerHeight + ($bannerTopMargin / 2)} 10px 0 0;
        background: rgba(18, 18, 18, .7);
        border: $borderSize solid $bannerBorderColor;
        max-height: 32vh;
        overflow-y: auto;
        overflow-x: hidden;

        &:hover {
            background: rgba(18, 18, 18, .5);
            /*cursor: pointer;*/
        }
    }

    .actionLog-entry {
        display: flex;
        align-items: center;
        height: 46px;

        &:first-child {
            filter: brightness(170%);
        }
    }

    .actionLog-entryIcon {
        width: $bannerHeight - ($borderSize * 2) - .5px;
        box-sizing: border-box;
        padding: 10px;
        flex: 1 0 auto;
    }

    .actionLog-entryText {
        font-size: 13px;
        font-family: "Space mono", sans-serif;
        color: $bannerTextColor;
        width: 320px;
    }

    @-moz-document url-prefix() {
        .actionLog-entry {
            margin-right: 20px;
        }
    }
</style>
