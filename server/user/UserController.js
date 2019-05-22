module.exports = function (deps) {

    const userRepository = deps.userRepository;

    return {
        login,
        getAll
    };

    async function login(req, res) {
        let user = await userRepository.addUser(req.body.name, req.body.secret);
        res.json(user);
    }

    async function getAll(req, res) {
        let users = await userRepository.getAll();
        res.json(users);
    }
};
