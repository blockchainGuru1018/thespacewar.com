require('dotenv').config();
const Express = require('express');
const CookieParser = require('cookie-parser');
const LoginCookieString = require('../serviceShared/LoginCookieString.js');

const app = Express();
app.use(CookieParser());

const Port = 8081;
const portPlayGame = process.env.PORT || 8080;
app.get('/fake-login', (req, res) => {
    const cookieString = new LoginCookieString()
        .id('august-id')
        .username('august-name')
        .country('se')
        .rating('10')
        .generateHash()
        .create();
    res.cookie('loggedin', cookieString);
    res.redirect(`http://${req.hostname}:${portPlayGame}`);
})

app.listen(Port, () => console.log('Listening on port: ' + Port));