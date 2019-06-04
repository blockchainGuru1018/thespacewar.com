<template>
    <div
        class="actionLog"
        ref="actionLog"
        @click="toggleExpanded"
    >
        <div
            v-for="(entry, index) in entries"
            :key="index"
            :title="getTitleText(entry)"
            class="actionLog-entry"
        >
            <img
                :src="entry.iconUrl"
                class="actionLog-entryIcon"
                alt="action log entry icon"
            >
            <span
                v-if="expanded"
                class="actionLog-entryText"
                v-html="getEntryHtml(entry)"
            />
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');

    module.exports = {
        data() {
            return {
                expanded: true
            }
        },
        computed: {
            ...matchHelpers.mapGetters([
                'actionLog'
            ]),
            entries() {
                return this.actionLog.queryLatest();
            }
        },
        watch: {
            entries() {
                setTimeout(() => {
                    this.$refs.actionLog.scrollTop = Number.MAX_SAFE_INTEGER;
                });
            }
        },
        methods: {
            toggleExpanded() {
                this.expanded = !this.expanded;
            },
            getEntryHtml(entry) {
                const textWithSubstitutedAmp = entry.text.split('&').join('_amp_');
                return encodeHtml(textWithSubstitutedAmp)
                    .split('_amp_').join('&')
                    .split(/\*/).join('<strong>')
                    .split(/#/).join('</strong>');
            },
            getTitleText(entry) {
                return entry.text
                    .split(/\*/).join('')
                    .split(/#/).join('');
            }
        }
    };

    function encodeHtml(html) {
        return html.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
            return '&#' + i.charCodeAt(0) + ';';
        });
    }
</script>
<style lang="scss">
    @import "../banner/banner";

    $borderSize: 2px;

    .actionLog {
        position: absolute;
        top: 0;
        right: 0;
        margin: #{$bannerTopMargin + $bannerHeight + ($bannerTopMargin / 2)} 10px 0 0;
        background: rgba(18, 18, 18, .2);
        border: $borderSize solid $bannerBorderColor;
        max-height: 320px;
        overflow-y: auto;
        overflow-x: hidden;

        &:hover {
            background: rgba(18, 18, 18, .5);
            cursor: pointer;
        }
    }

    .actionLog-entry {
        display: flex;
        align-items: center;
        height: 46px;

        &:last-child {
            filter: brightness(160%);
        }
    }

    .actionLog-entryIcon {
        width: $bannerHeight - ($borderSize * 2);
        box-sizing: border-box;
        padding: 10px;
    }

    .actionLog-entryText {
        font-size: 13px;
        font-family: "Space mono", sans-serif;
        color: $bannerTextColor;
        width: 320px;

    }
</style>
