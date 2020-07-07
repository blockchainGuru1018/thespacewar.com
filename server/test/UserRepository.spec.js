const UserRepository = require("../user/UserRepository.js");
const UserBuilder = require("../../shared/user/UserBuilder");
const LoginCookieString = require("../../serviceShared/LoginCookieString");

test("when store a user with cookie id and retrieve cookie id it should be the same as provided", () => {
    const userRepository = UserRepository({
        socketMaster: fakeSockerMaster(),
    });
    const user = createUser();
    const loginCookieString = createLoginCookieStringWithId("COOKIE_ID");

    userRepository.addUserAndClearOldUsers(user, "", loginCookieString);
    const userCookieId = userRepository.getUserCookieId(user.id);

    expect(userCookieId).toBe("COOKIE_ID");
});

function createUser() {
    return new UserBuilder().country("se").name("august").rating(0).build();
}

function createLoginCookieStringWithId(id) {
    return new LoginCookieString()
        .country("se")
        .rating(0)
        .username("august")
        .id(id)
        .create();
}

function fakeSockerMaster() {
    return {
        emit: () => {},
    };
}
