module.exports = function SecurityMiddleware({
    userRepository
}) {

    return {
        isAuthorized,
        middleware
    };

    function isAuthorized(secret, userId) {
        return userId === userRepository.userIdFromSecret(secret);
    }

    function middleware(req, res, next) {
        const requestPlayerId = req.params.playerId || req.body.playerId;
        if (requestPlayerId) {
            if (req.body.secret) {
                if (!isAuthorized(req.body.secret, requestPlayerId)) {
                    deps.logger.log('Unauthorized user making request to url: ' + req.url, 'authorization');
                    next(new Error('Unauthorized access'));
                }
            }
            else {
                deps.logger.log('Unauthorized user making request to url without providing secret: ' + req.url, 'authorization');
                next(new Error('Please provider client secret'));
            }
        }

        next();
    }
};
