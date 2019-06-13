<template>
    <div
        :class="classes"
        @click="$emit('select')"
    >
        <div class="commanderCard-name">
            <slot />
        </div>
    </div>
</template>
<script>
    module.exports = {
        props: ['selected'],
        computed: {
            classes() {
                const classes = ['commanderCard', 'card', 'card-faceDown'];
                if (this.selected) {
                    classes.push('commanderCard--selected');
                }
                return classes;
            }
        }
    }
</script>
<style lang="scss">
    .commanderCard {
        margin: 0 10px;
        z-index: 1;
    }

    .commanderCard-name {
        font-size: 26px;
        font-family: "Space mono", monospace;
        color: white;
        z-index: 1;
        margin: auto auto;
        text-align: center;
        text-shadow: 0px -2px 0px rgba(0, 0, 0, .5),
        0px 2px 0px rgba(0, 0, 0, .5);
        letter-spacing: -.1em;
        line-height: 90%;

        &::before {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            content: "";
            background: rgba(0, 0, 0, .6);
            z-index: -1;
        }
    }
</style>
