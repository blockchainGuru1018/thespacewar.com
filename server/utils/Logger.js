class Logger {

    constructor() {
        this._logsByType = {};
    }

    log(message, type = 'normal') {
        this._logsByType[type] = this._logsByType[type] || [];
        this._logsByType[type].push(message);
    }

    read(type = 'normal') {
        return this._logsByType[type].join('\n');
    }

    readAll() {
        const all = [];
        for (const type of Object.keys(this._logsByType)) {
            all.push(`\t${type}:`);
            all.push(...this._logsByType[type]);
        }
        return all.join('\n');
    }

    clear() {
        this._logsByType = {};
    }
}

module.exports = Logger;