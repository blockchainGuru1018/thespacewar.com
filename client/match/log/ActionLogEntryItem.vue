<template>
    <div

            :title="getTitleText(entry)"
            class="actionLog-entry"
    >
        <img
                :src="getIconImage(entry)"
                class="actionLog-entryIcon"
                alt="action log entry icon"
        >
        <span
                v-if="expanded"
                class="actionLog-entryText"
                ref="card-span"
                @click="logEntryCardClicked($event,entry)"
                v-html="getEntryHtml(entry)"
        >
        </span>
    </div>
</template>

<script>
    import ActionLogEntryHelper from "./ActionLogEntryHelper.js";

    const Vuex = require('vuex');
    const expandedCardHelpers = Vuex.createNamespacedHelpers('expandedCard');

    export default {
        name: 'ActionLogEntryItem',
        props: {
            entry: {},
            expanded: false,
        },
        methods: {
            ...expandedCardHelpers.mapActions({
                expandCard: 'expandCard',
                expandCardByCommonId: 'expandCardByCommonId',
            }),
            logEntryCardClicked(e, entry) {
                e.preventDefault();
                if (e.target.className === 'log-entry-card-link') {
                    e.stopPropagation();
                    this.expandLogCard(entry);
                }
            },
            expandLogCard(entry) {
                if (entry.cardCommonId) {
                    this.expandCardByCommonId(entry.cardCommonId);
                } else if (entry.cardCommonIds) {
                    this.expandCardByCommonId(entry.cardCommonIds[0]);
                }
            },
            getEntryHtml(entry) {
                return ActionLogEntryHelper(entry).htmlWithOrWithoutLink();
            },
            getTitleText(entry) {
                return ActionLogEntryHelper(entry).titleText();
            },
            getIconImage(entry) {
                return entry.iconUrl;
            }
        }
    }
</script>

<style lang="scss">
    .log-entry-card-link {
        text-decoration: underline;
        cursor: pointer;
        font-weight: 900;
        transform: translate(-50%, -50%) scale(1.8);
        left: 50%;
        top: 50%;
    }
</style>