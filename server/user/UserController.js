module.exports = function (deps) {

    const userRepository = deps.userRepository;

    return {
        login,
        getAll
    }

    async function login(req, res) {
        let name = req.body.name;
        let user = await userRepository.addUser(name);
        res.json(user);
    }

    async function getAll(req, res) {
        let users = await userRepository.getAll();
        res.json(users);
    }
}