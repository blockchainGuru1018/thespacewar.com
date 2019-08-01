<template>
    <div :class="classes">
        <div class="dimOverlay-content">
            <slot />
        </div>
        <button @click="toggleOverlay" class="dimOverlay-toggleOverlay darkButton--onlyLook">
            Toggle overlay
        </button>
    </div>
</template>
<script>
    module.exports = {
        data() {
            return {
                hideOverlay: false
            };
        },
        computed: {
            classes() {
                const classes = ['dimOverlay'];
                if (this.hideOverlay) {
                    classes.push('dimOverlay--hidden');
                }
                return classes;
            }
        },
        methods: {
            toggleOverlay() {
                this.hideOverlay = !this.hideOverlay;
            }
        }
    }
</script>