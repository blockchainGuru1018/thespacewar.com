import ToggleSwarmDeckButton from "../start/ToggleSwarmDeckButton";
import {mount} from "@vue/test-utils";

const mockLocalStorageResponse = (response) => {
    Object.defineProperty(window, "localStorage", {
        value: {
            getItem: jest.fn(() => response),
            setItem: jest.fn(() => true)
        },
        writable: true
    });
}

describe('swarm deck toggle', () => {


    it('should not display the toggle swarm deck when "ft-swarm-toggle" its on local store as "false"', () => {
        // Arrange
        mockLocalStorageResponse('false');
        let wrapper = mount(ToggleSwarmDeckButton);
        // Assert
        expectNotToBeDisplayed(wrapper);
    });

    it('should not display the toggle swarm deck when "ft-swarm-toggle" its not local store', () => {
        // Arrange
        mockLocalStorageResponse(undefined);
        let wrapper = mount(ToggleSwarmDeckButton);

        // Assert
        expectNotToBeDisplayed(wrapper);
    });

    it('should  display the toggle swarm deck when "ft-swarm-toggle" its on local store as "true"', () => {
        // Arrange
        mockLocalStorageResponse('true');
        let wrapper = mount(ToggleSwarmDeckButton);

        // Assert
        expect(wrapper.vm.swarmDeckToggleVisible).toBe(true);
        expect(window.localStorage.getItem).toHaveBeenCalledWith('ft-swarm-toggle');
        expect(wrapper.find('label').exists()).toBeTruthy();
    });
});


const expectNotToBeDisplayed = (wrapper) => {
    expect(wrapper.vm.swarmDeckToggleVisible).toBe(false);
    expect(window.localStorage.getItem).toHaveBeenCalledWith('ft-swarm-toggle');
    expect(wrapper.find('label').exists()).toBeFalsy();
}