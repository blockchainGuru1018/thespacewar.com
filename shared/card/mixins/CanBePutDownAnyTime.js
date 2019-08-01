module.exports = superclass => class extends superclass {
    canBePutDownAnyTime() {
        return this.type === 'event';
    }
};
