module.exports = function ({
    userRepository,
    gameConfig
}) {

    return {
        login,
        testAccessKey,
        getAll
    };

    async function login(req, res) {
        if (req.body.accessKey !== gameConfig.accessKey()) new Error('Wrong key');

        let user = await userRepository.addUser(req.body.name, req.body.secret);
        res.json(user);
    }

    function testAccessKey(req, res) {
        res.json({ valid: req.body.key === gameConfig.accessKey() });
    }

    async function getAll(req, res) {
        let users = await userRepository.getAll();
        res.json(users);
    }
};
