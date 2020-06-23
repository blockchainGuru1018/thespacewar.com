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

    it('should NOT display the toggle for the Swarm Deck when its feature toggle is off', () => {
        mockLocalStorageResponse('false');
        let wrapper = mount(ToggleSwarmDeckButton);

        expectNotToBeDisplayed(wrapper);
    });

    it('should not display the toggle swarm deck when "ft-swarm-toggle" its not local store', () => {
        mockLocalStorageResponse(undefined);
        let wrapper = mount(ToggleSwarmDeckButton);

        expectNotToBeDisplayed(wrapper);
    });

    it('should  display the toggle swarm deck when "ft-swarm-toggle" its on local store as "true"', () => {
        mockLocalStorageResponse('true');
        let wrapper = mount(ToggleSwarmDeckButton);

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