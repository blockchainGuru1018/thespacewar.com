module.exports = function ({
                               socketRepository,
                               matchRepository,
                               userRepository,
                               securityController,
                               logger,
                               controllers,
                               connection
                           }) {

    const BotId = 'BOT';
    let connectedUserId;

    init();

    function init() {
        connection.on('registerConnection', onRegisterConnection);
        connection.on('reconnectBot', onReconnectBot);
        connection.on('disconnect', onDisconnect);
        connection.on('match', onMatchMessage);
    }

    async function onRegisterConnection({secret, userId}) {
        if (!securityController.isAuthorized(secret, userId)) {
            logger.log('Unauthorized user performing action on match', 'authorization');
            return;
        }

        connectedUserId = userId;

        socketRepository.setForUser(userId, connection);
        userRepository.updateUser(userId, user => {
            user.connected();
        });

        const ongoingMatch = matchRepository.getForUser(userId);
        if (ongoingMatch) {
            try {
                await matchRepository.reconnect({
                    playerId: userId,
                    matchId: ongoingMatch.id
                });
            } catch (error) {
                logger.log('Error when registering connection for user: ' + error.message, 'reconnect error');
                logger.log('Raw error: ' + error, 'reconnect error');
            }
        }
    }

    async function onReconnectBot({secret, userId}) {
        if (!securityController.isAuthorized(secret, userId)) {
            logger.log('Unauthorized user performing action on match', 'authorization');
            return;
        }

        const ongoingMatch = matchRepository.getForUser(userId);
        if (ongoingMatch) {
            try {
                await matchRepository.reconnectBot({
                    playerId: userId,
                    matchId: ongoingMatch.id
                });
            } catch (error) {
                logger.log('Error when reconnecting bot: ' + error.message, 'reconnect error');
                logger.log('Raw error: ' + error, 'reconnect error');
            }
        }
    }

    function onDisconnect() {
        if (connectedUserId) {
            userRepository.updateUser(connectedUserId, user => {
                user.disconnected();
            });
        }
    }


    async function onMatchMessage(data) {
        if (!isSocketMessageAuthorized(data)) {
            logger.log('Unauthorized user performing action on match', 'authorization');
            return;
        }

        try {
            await controllers.match.onAction(data);
        } catch (error) {
            const rawErrorMessage = JSON.stringify(error, null, 4);
            const dataString = JSON.stringify(data, null, 4);
            const errorMessage = `(${new Date().toISOString()}) Error in action to match: ${error.message} - DATA: ${dataString} - RAW ERROR: ${rawErrorMessage}`
            logger.log(errorMessage, 'error');
            logger.log(error.stack, 'error-stack');
        }
    }

    function isSocketMessageAuthorized(data) {
        const playerId = data.playerId === BotId ? data.playerIdControllerBot : data.playerId;
        return securityController.isAuthorized(data.secret, playerId);
    }
};
