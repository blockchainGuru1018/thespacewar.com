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
                v-html="getEntryHtml(entry)"
        />
    </div>
</template>

<script>
    import ActionLogEntryHelper from "./ActionLogEntry.js";

    export default {
        name: 'ActionLogEntryItem',
        props: {
            entry: {},
            expanded: false
        },
        methods: {
            getEntryHtml(entry) {
                return ActionLogEntryHelper(entry).html();
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

<style lang="scss" >
    a {
        text-decoration: underline;
    }
</style>