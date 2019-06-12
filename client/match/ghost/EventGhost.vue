<template>
    <transition name="fade-fast">
        <div
            :data-location="location"
            :class="['playerEventCardGhost', 'ghost', {'playerEventCardGhost--hoveredOver': elementHoveredOver === $el }]"
            @click.stop="click"
            @mouseup="mouseup"
        >
            <div class="activateEventCard">
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
            ])
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
