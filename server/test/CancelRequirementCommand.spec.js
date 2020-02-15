const CancelRequirementCommand = require('../match/command/CancelRequirementCommand.js');

test('should match only requirements that are cancelable', () => {
    const requirementUpdater = { exists: () => true, resolve: jest.fn() };
    const createPlayerRequirementUpdater = jest.fn().mockReturnValue(requirementUpdater);
    const command = createCommand({ createPlayerRequirementUpdater });

    command();

    expect(createPlayerRequirementUpdater).toBeCalledWith({ cancelable: true });
    expect(requirementUpdater.resolve).toBeCalled();
});

test('should match only requirements that are cancelable', () => {
    const requirementUpdater = { exists: () => false, resolve: jest.fn() };
    const createPlayerRequirementUpdater = () => requirementUpdater;
    const command = createCommand({ createPlayerRequirementUpdater });

    const error = catchError(() => command());

    expect(error).toBeDefined();
    expect(error.message).toBe('No cancelable requirement');
    expect(requirementUpdater.resolve).not.toBeCalled();
});

function createCommand(options = {}) {
    return CancelRequirementCommand({
        ...options
    });
}

function catchError(callback) {
    try {
        callback();
    }
    catch (error) {
        return error;
    }
}
