const child_process = require('child_process');
const path = require('path');
const spawnIndependently = require('./spawnIndependently.js');

const USING_PM2 = true;

module.exports = {
    installNpmPackages,
    startServer
};

function installNpmPackages() {
    const clientPath = path.join(__dirname, '..', 'client');
    const serverPath = path.join(__dirname, '..', 'server');
    console.log(' (1/2) - Installing dependencies');
    child_process.execSync(`cd ${clientPath} && npm install && cd ${serverPath} && npm install`);
}

function startServer() {
    const startServerFileName = process.env.production ? 'startInProduction.js' : 'startInDevelopment.js';
    const serverFilePath = path.join(__dirname, '..', 'scripts', startServerFileName);
    console.log(' (2/2) - Starting server using ' + (USING_PM2 ? 'pm2' : 'node'));
    if (USING_PM2) {
        spawnIndependently('pm2', ['start', serverFilePath]);
    }
    else {
        spawnIndependently('node', [serverFilePath]);
    }
    console.log(' Done - Server instance is now running in the background')
}