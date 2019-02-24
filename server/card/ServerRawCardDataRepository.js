const fs = require('fs');
const path = require('path');
const axios = require('axios');
const RawCardDataRepository = require('../../shared/card/RawCardDataRepository.js');

module.exports = function () {
    return RawCardDataRepository({ getCardData, cache: Cache() });
}

async function getCardData() {
    const url = 'https://admin.thespacewar.com/services/api/cards';
    console.log('Getting fresh cards JSON from:', url);

    const response = await axios.get(url);
    return response.data;
}

function Cache() {

    return {
        getItem,
        setItem,
        removeItem
    };

    function setItem(key, item) {
        const keyFilePath = filePath(key);

        return new Promise((resolve, reject) => {
            fs.writeFile(keyFilePath, item, 'utf8', err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    function getItem(key) {
        const keyFilePath = filePath(key);

        return new Promise((resolve, reject) => {
            fs.readFile(keyFilePath, 'utf8', (err, data) => {
                if (err) resolve(null);
                resolve(data);
            });
        });
    }

    function removeItem(key) {
        const keyFilePath = filePath(key);

        return new Promise((resolve, reject) => {
            fs.unlink(keyFilePath, err => {
                if (err) console.error(`Failed removing file with name ${key}`);
                resolve();
            });
        });
    }

    function filePath(key) {
        return path.join(__dirname, `${key}.cache.json`);
    }
}