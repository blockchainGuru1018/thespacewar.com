<template>
    <div
        v-if="!holdingCard"
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
    const cardHelpers = Vuex.createNamespacedHelpers('card');

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
            ...cardHelpers.mapState([
                'holdingCard'
            ]),
            entries() {
                return this.actionLog.queryLatest().slice().reverse();
            }
        },
        methods: {
            toggleExpanded() {
                this.expanded = !this.expanded;
            },
            getEntryHtml(entry) {
                const textWithSubstitutedSensitiveCharacters = entry.text
                    .split('&').join('_amp_')
                    .split('s').join('_115_')
                    .split('S').join('_83_');
                return encodeHtml(textWithSubstitutedSensitiveCharacters)
                    .split('_amp_').join('&')
                    .split('_115_').join('s')
                    .split('_83_').join('S')
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
        z-index: 3;

        margin: #{$bannerTopMargin + $bannerHeight + ($bannerTopMargin / 2)} 10px 0 0;
        background: rgba(18, 18, 18, .7);
        border: $borderSize solid $bannerBorderColor;
        max-height: 32vh;
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
