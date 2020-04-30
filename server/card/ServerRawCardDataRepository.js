const fs = require('fs');
const path = require('path');
const axios = require('axios');
const RawCardDataRepository = require('../../shared/card/RawCardDataRepository.js');

module.exports = function () {
    return RawCardDataRepository({ getCardData, cache: Cache() });
};

async function getCardData() {
    const url = 'https://admin.thespacewar.com/services/api/cards?deck=1';
    console.info('Getting fresh cards JSON from:', url);

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
        return writeToFile(item, filePath(key));
    }

    function getItem(key) {
        return readFile(filePath(key));
    }

    async function removeItem(key) {
        try {
            await deleteFile(filePath(key));
        }
        catch (ex) {
            console.error(`Failed removing file with name ${key}`);
        }
    }

    function filePath(key) {
        return path.join(__dirname, `${key}.cache.json`);
    }

    function readFile(keyFilePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(keyFilePath, 'utf8', (err, data) => {
                if (err) resolve(null);
                resolve(data);
            });
        });
    }

    function deleteFile(keyFilePath) {
        return new Promise((resolve, reject) => {
            fs.unlink(keyFilePath, err => {
                if (err) {
                    reject();
                }
                else {
                    resolve();
                }
            });
        });
    }

    function writeToFile(item, keyFilePath) {
        return new Promise((resolve, reject) => {
            fs.writeFile(keyFilePath, item, 'utf8', err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}
