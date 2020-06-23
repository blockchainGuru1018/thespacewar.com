const child_process = require('child_process');
const path = require('path');
const spawnIndependently = require('./spawnIndependently.js');

const PRODUCTION = true;
const USING_PM2 = true;

module.exports = {
    installNpmPackages,
    startServer
};

function installNpmPackages() {
    const scriptPath = path.join(__dirname);
    console.info(' (1/2) - Installing dependencies');
    child_process.execSync(`cd ${scriptPath} && npm install-all`);
}

function startServer() {
    const startServerFileName = PRODUCTION ? 'startInProduction.js' : 'startInDevelopment.js';
    const serverFilePath = path.join(__dirname, '..', 'scripts', startServerFileName);
    console.info(' (2/2) - Starting server using ' + (USING_PM2 ? 'pm2' : 'node'));
    if (USING_PM2) {
        spawnIndependently('pm2', ['start', serverFilePath]);
    }
    else {
        spawnIndependently('node', [serverFilePath]);
    }
    console.info(' Done - Server instance is now running in the background')
}
