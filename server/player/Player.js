module.exports = function (deps) {

    const id = deps.id;
    const name = deps.name;
    const connection = deps.connection;

    return {
        id,
        name,
        connection
    };
}