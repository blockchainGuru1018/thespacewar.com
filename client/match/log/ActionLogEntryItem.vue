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
                @click="logEntryCardClicked($event)"
                v-html="getEntryHtml(entry)"
        >
        </span>
    </div>
</template>

<script>
    import ActionLogEntryHelper from "./ActionLogEntry.js";

    export default {
        name: 'ActionLogEntryItem',
        props: {
            entry: {},
            expanded: false,

        },
        methods: {
            logEntryCardClicked(e) {
                e.preventDefault();
                if (e.target.className === 'log-entry-card-link') {
                    this.displayCardPreview();
                }
            },
            getEntryHtml(entry) {
                console.log(entry);
                return ActionLogEntryHelper(entry).htmlWithOrWithoutLink();
            },
            getTitleText(entry) {
                return ActionLogEntryHelper(entry).titleText();
            },
            getIconImage(entry) {
                return entry.iconUrl;
            },
            displayCardPreview() {

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