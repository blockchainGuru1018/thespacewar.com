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
        >
            {{normalizeText(entry)}}
            <a class="log-entry-card-link" @click="expandLogCard" v-if="isClickableAction(entry)"> <strong> {{boldEffect(entry)}}</strong></a>
            <strong v-else> {{boldEffect(entry)}}</strong>
        </span>
    </div>
</template>

<script>
    import ActionLogEntryHelper from "./ActionLogEntry.js";

    const Vuex = require('vuex');
    const expandedCardHelpers = Vuex.createNamespacedHelpers('expandedCard');
    const cardHelpers = Vuex.createNamespacedHelpers('card');
    export default {
        name: 'ActionLogEntryItem',
        props: {
            entry: {},
            expanded: false,

        },
        methods: {
            ...cardHelpers.mapActions([
                'getCardDataByCommonId'
            ]),
            ...expandedCardHelpers.mapActions([
                'expandCard'
            ]),
            isClickableAction(entry) {
                return ['played',
                    'moved',
                    'repairedCard',
                    'paralyzed',
                    'countered',
                    'counteredAttackOnCard',
                    'damagedInAttack',
                    'triggered',
                    'receivedCardFromCommander',
                ].includes(entry.action);
            },
            normalizeText(entry) {
                console.log(entry);
                // Mr.Roboto expanded station by *1 station card#
                return entry.text.replace("*", "**").split(/\*\*/)[0];
            },
            boldEffect(entry) {
                console.log(entry.text.replace("*", "**").split(/\*\*/));
                return entry.text.replace("*", "**").split(/\*\*/)[1].replace("*", "").replace("##", "").replace("#", "");
            },
            async expandLogCard() {
                if (this.entry.cardCommonId) {
                    this.expandCard(await this.getCardDataByCommonId(this.entry.cardCommonId));
                }
                if (this.entry.cardCommonIds) {
                    this.expandCard(await this.getCardDataByCommonId(this.entry.cardCommonIds[0]));
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
    }
</style>