const axios = require('axios');

async function testLogin() {
    console.log('Login test:');
    try {
        const response = await axios.post('https://thespacewar.com/login');
        console.log('RESPONSE', response);

        const data = response.data;
        console.log('DATA', data);
    } catch (error) {
        console.log('ERROR', error);
    }
    console.log('---\n');
}

async function testRegister() {
    console.log('Register test:');
    try {
        const response = await axios.post('https://thespacewar.com/login');
        console.log('RESPONSE', response);

        const data = response.data;
        console.log('DATA', data);
    } catch (error) {
        console.log('ERROR', error);
    }
    console.log('---\n');
}

testLogin();
testRegister();