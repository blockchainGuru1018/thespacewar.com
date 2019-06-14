<template>
    <transition name="fade-fast">
        <div
            :class="classes"
            @click.stop="click"
            @mouseup="mouseup"
        >
            <div
                ref="activateEventCard"
                :data-location="location"
                class="activateEventCard ghost"
            >
                Activate
            </div>
        </div>
    </transition>
</template>
<script>
    const Vuex = require('vuex');
    const cardHelpers = Vuex.createNamespacedHelpers('card');

    module.exports = {
        props: [
            'elementHoveredOver'
        ],
        data() {
            return {
                location: 'zone'
            }
        },
        computed: {
            ...cardHelpers.mapState([
                'draggingCard'
            ]),
            classes() {
                const classes = ['playerEventCardGhost'];
                if (this.elementHoveredOver === this.$refs.activateEventCard) {
                    classes.push('playerEventCardGhost--hoveredOver');
                }
                return classes;
            }
        },
        methods: {
            mouseup() {
                if (this.draggingCard) {
                    this.$emit('click', this.location);
                }
            },
            click() {
                this.$emit('click', this.location);
            }
        }
    }
</script>
