import {shallowMount, createLocalVue, mount} from '@vue/test-utils';
import Vuex from 'vuex';
import ActionLog from "../match/log/ActionLog";
import ActionLogEntryItem from "../match/log/ActionLogEntryItem";

const localVue = createLocalVue();
localVue.use(Vuex);

describe('ActionLog', () => {
    let store;
    const mockStore = () => {
        store = new Vuex.Store({
            modules: {
                card: {
                    namespaced: true,
                    state: {},
                    actions: {},
                    getters: {}
                }, actionLog: {
                    namespaced: true,
                    state: {
                        expanded: true
                    },
                    actions: {},
                    getters: {}
                }, match: {
                    namespaced: true,
                    match: {},
                    actions: {},
                    getters: {
                        actionLog: () => {
                            return {
                                queryLatest: () => [
                                    {//Mr.Roboto expanded station by <strong>1 station card</strong>
                                        action: "expandedStation",
                                        count: 1,
                                        iconUrl: "/icon/expand.svg",
                                        text: "Mr.Roboto expanded station by *1 station card#",
                                    },
                                    {
                                        action: "played",//Mr.Roboto played <strong><strong>Fast Missile</strong></strong></span>
                                        cardIds: ["6:70723"],
                                        iconUrl: "/icon/played.svg",
                                        text: "Mr.Roboto played **Fast Missile##",
                                    }
                                ]
                            }
                        }
                    }
                },

            }
        })
    }

    it('Should render a ActionLogEntryItem for each action log in the store', () => {
        // Arrange
        mockStore();
        const wrapper = shallowMount(ActionLog, {store, localVue})

        // Act

        // Assert
        expect(wrapper.findAll(ActionLogEntryItem).length).toBe(2)
    });

    it('Each logEntry when is and card name on it it should displayed as a link', () => {
        // Arrange
        mockStore();
        const wrapper = mount(ActionLog, {store, localVue})
        const entryLogs = wrapper.findAll(ActionLogEntryItem);
        const expectedHTMLForLogEntry = `<div title="Mr.Roboto played Fast Missile" class="actionLog-entry"><img src="/icon/played.svg" alt="action log entry icon" class="actionLog-entryIcon"> <span class="actionLog-entryText">Mr.Roboto played <a><strong>Fast Missile</strong></a></span></div>`

        // Act

        // Assert
        expect(entryLogs.wrappers[0].html()).toBe(expectedHTMLForLogEntry);

    });

    it(`should call previewCard method when card name's link clicked`, () => {
        // Arrange
        mockStore();
        const wrapper = mount(ActionLog, {store, localVue})
        const displayCardPReview = jest.fn();
        const entryLogs = wrapper.findAll(ActionLogEntryItem);
        // Act
        entryLogs.wrappers[0].find('a').trigger('click');
        // Assert
        expect(displayCardPReview).toHaveBeenCalledTimes(1);

    });
});