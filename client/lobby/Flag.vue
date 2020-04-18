<template>
    <img
        :src="flagImageUrl"
        alt="user country flag"
        class="flag"
    >
</template>
<script>
    export default {
        name: 'Flag',
        props: {
            country: {
                type: String,
                default: ''
            }
        },
        computed: {
            flagImageUrl() {
                return `https://staticjw.com/redistats/images/flags/${this.country}.gif`;
            }
        }
    }
</script>
<style scoped lang="scss">
    .flag {
        position: relative;
        margin-left: 8px;
        width: 1.3rem;
        top: 2px;
    }
</style>