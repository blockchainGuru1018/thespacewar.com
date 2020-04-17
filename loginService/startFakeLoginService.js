const Express = require('express');
const CookieParser = require('cookie-parser');
const LoginCookieString = require('../serviceShared/LoginCookieString.js');

const app = Express();
app.use(CookieParser());

const Port = 8081;

app.get('/', (req, res) => {
    const cookieString = new LoginCookieString()
        .id('august-id')
        .username('august-name')
        .country('sweden')
        .rating('10')
        .generateHash()
        .create();
    res.cookie('loggedin', cookieString);
    res.status(200);
    res.end();
})

app.listen(Port, () => console.log('Listening on port: ' + Port));