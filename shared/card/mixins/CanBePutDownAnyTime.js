module.exports = superclass => class extends superclass {
    canBePutDownAnyTime() {
        return this._matchService.isGameOn()
            && this.type === 'event';
    }
};
