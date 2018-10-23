module.exports = function wrapControllersWithRejectionProtection(controllerMap) {
    let wrappedControllerMap = {};
    Object.keys(controllerMap).forEach(name => {
        wrappedControllerMap[name] = {};
        Object.keys(controllerMap[name]).forEach(methodName => {
            wrappedControllerMap[name][methodName] = async (req, res, next) => {
                try {
                    await controllerMap[name][methodName](req, res);
                }
                catch (error) {
                    console.error('ERROR: ' + error.message)
                    console.info('Raw error:', error)
                    res.status(500).end(error.message);
                    next(error);
                }
            }
        });
    });
    return wrappedControllerMap;
};