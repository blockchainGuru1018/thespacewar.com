<template>
    <transition name="fade-fast">
        <div
            :class="['card', 'card-ghost', {'card-ghost--hoveredOver': elementHoveredOver === $el }]"
            :data-location="location"
            @click.stop="click"
            @mouseup="mouseup"
        >
            <slot></slot>
        </div>
    </transition>
</template>
<script>
    const Vuex = require('vuex');
    const cardHelpers = Vuex.createNamespacedHelpers('card');

    module.exports = {
        props: [
            'location',
            'elementHoveredOver'
        ],
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
