const axios = require('axios');
const qs = require('querystring');

async function registerLogGame(user_won, user_lost, length) {
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return await axios.post('/log-game', qs.stringify({
        user_won: user_won,
        user_lost: user_lost,
        length: length
    }), config).then(response => {
        return {message: response.data}
    }).then(error => {
        return {message: error.message}
    });
}
module.exports = registerLogGame;

