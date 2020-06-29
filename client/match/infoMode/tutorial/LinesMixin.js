const LeaderLine = window.LeaderLine;

export default function (selectorPairs) {

    return {
        data() {
            return {
                lines: []
            };
        },
        mounted() {
            this.lines = selectorPairs.map(pair => new LeaderLine(leaderLineOptionsFromSelectorPair(pair)));
        },
        destroyed() {
            this.lines.forEach(line => line.remove());
        }
    };
}

function leaderLineOptionsFromSelectorPair([start, end]) {
    return {
        start: document.querySelector(start),
        end: document.querySelector(end),
        color: 'red'
    };
}
