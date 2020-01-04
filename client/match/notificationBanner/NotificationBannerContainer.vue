<template>
    <portal
        v-if="wrapperVisible"
        to="match"
    >
        <NotificationBanner
            :visible="bannerVisible"
            :notificationHtml="notificationHtml"
        />
    </portal>
</template>

<script>
    import NotificationBanner from "./NotificationBanner.vue";
    import Vuex from 'vuex';

    const notificationBannerHelpers = Vuex.createNamespacedHelpers('notificationBanner');

    export default {
        name: "NotificationBannerContainer",
        components: { NotificationBanner },
        computed: {
            ...notificationBannerHelpers.mapState([
                'wrapperVisible',
                'bannerVisible',
                'notificationHtml'
            ])
        }
    }
</script>
