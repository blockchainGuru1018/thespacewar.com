import ActionLogEntry from "../log/ActionLogEntry.js";

const TimeVisible = 3000;
const ApproximateLengthOfCssLeaveTransition = 1500;

export function NotificationBannerStore() {
    let timeoutId = null;

    return {
        namespaced: true,
        name: 'notificationBanner',
        state: {
            wrapperVisible: false,
            bannerVisible: false,
            notificationHtml: ''
        },
        actions: {
            showForActionLogEntry
        }
    };

    async function showForActionLogEntry({ state }, entry) {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;

            state.wrapperVisible = false;
            state.bannerVisible = false;
            await wait();
        }

        state.wrapperVisible = true;
        state.notificationHtml = ActionLogEntry(entry).html();

        timeoutId = setTimeout(() => {
            state.bannerVisible = true;

            timeoutId = setTimeout(() => {
                state.bannerVisible = false;
                timeoutId = setTimeout(() => {
                    state.wrapperVisible = false;
                }, ApproximateLengthOfCssLeaveTransition);
            }, TimeVisible);
        });
    }
}

function wait() {
    return new Promise(resolve => {
        setTimeout(resolve);
    });
}
