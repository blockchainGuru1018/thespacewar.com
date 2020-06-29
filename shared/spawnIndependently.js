const child_process = require('child_process');

module.exports = function spawnIndependently(command, arguments) {
    const child = child_process.spawn(command, arguments, {
        detached: true,
        stdio: ['ignore']
    });
    child.unref();
};