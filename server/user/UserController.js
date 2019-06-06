module.exports = function ({
    userRepository,
    gameConfig
}) {

    return {
        login,
        getAll
    };

    async function login(req, res) {
        if (req.body.secret.startsWith(gameConfig.accessKey())) throw new Error('Wrong key');

        let user = await userRepository.addUser(req.body.name, req.body.secret);
        res.json(user);
    }

    async function getAll(req, res) {
        let users = await userRepository.getAll();
        res.json(users);
    }
};
