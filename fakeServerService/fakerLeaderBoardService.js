const Express = require('express');
const bodyParser = require('body-parser');
const CookieParser = require('cookie-parser');

const app = Express();
app.use(CookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const Port = 8083;

app.post('/leader-board', (req, res) => {
    return res.json([
        {Username: 'Alvin', Country: 'se', Wins: 8, Losses: 4, WinRate: '67%', Rating: 2680, Total: 2680},
        {Username: 'Jim', Country: 'se', Wins: 3, Losses: 8, WinRate: '33%', Rating: 660, Total: 825},
        {Username: 'AugustAlex', Country: 'se', Wins: 0, Losses: 4, WinRate: '100%', Rating: 1500, Total: 1500},
        {Username: 'Viper', Country: 'tr', Wins: 0, Losses: 0, WinRate: '0%', Rating: 0, Total: 0},
        {Username: 'Agge', Country: 'se', Wins: 0, Losses: 3, WinRate: '0%', Rating: 0, Total: 0},
        {Username: 'Kaah', Country: 'bo', Wins: 0, Losses: 0, WinRate: '0%', Rating: 0, Total: 0},
        {Username: 'Rhuanco', Country: 'bo', Wins: 0, Losses: 0, WinRate: '0%', Rating: 0, Total: 0},
    ]);
});

app.listen(Port, () => console.log('Listening on port: ' + Port));