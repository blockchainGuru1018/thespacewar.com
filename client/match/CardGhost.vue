<template>
    <div :class="['card', 'card-ghost', {'card-ghost--hoveredOver': elementHoveredOver === $el }]"
         :data-location="location"
         @click.stop="click"/>
</template>
<script>
    module.exports = {
        props: ['location', 'elementHoveredOver'],
        methods: {
            click() {
                this.$emit('click', this.location);
            }
        }
    }
</script>
