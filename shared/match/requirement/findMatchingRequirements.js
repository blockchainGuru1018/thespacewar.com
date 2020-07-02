module.exports = function findMatchingRequirement(requirements, { type, common = null, waiting = null, cancelable = null }) {
    return requirements.find(r => {
        return (type === null || r.type === type)
            && (common === null || r.common === common)
            && (waiting === null || r.waiting === waiting)
            && (cancelable === null || r.cancelable === cancelable);
    });
};
