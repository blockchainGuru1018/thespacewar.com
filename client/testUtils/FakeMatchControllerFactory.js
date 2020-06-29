const FakeMatchController = require('./FakeMatchController.js');

module.exports = function FakeMatchControllerFactory({ matchController = FakeMatchController() } = {}) {
    let _dispatch;
    return {
        create: ({ dispatch }) => {
            _dispatch = dispatch;
            return matchController;
        },
        getStoreDispatch: () => _dispatch
    }
}