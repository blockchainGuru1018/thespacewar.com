module.exports = ({Cookie, UserAuth}) => {
    return {
        checkSession: () => {
            let session = Cookie.getItem('loggedin');
            if (typeof session != "undefined") {
                let sections = session.split(':');
                return new UserAuth({
                    id: sections[0],
                    username: sections[1],
                    country: sections[2],
                    rating: sections[3]
                });
            }

            return new UserAuth;
        }
    }
};