import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import Vuex from "vuex";
import ActionLog from "../match/log/ActionLog";
import ActionLogEntryItem from "../match/log/ActionLogEntryItem";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("ActionLog", () => {
  let store;

  it("Should render a ActionLogEntryItem for each action log in the store", () => {
    store = mockStore();
    const wrapper = mount(ActionLog, { store, localVue });

    expect(wrapper.find("a").exists()).toBeTruthy();
    expect(wrapper.find("a").text()).toBe("Fast Missile");
    expect(wrapper.findAll(ActionLogEntryItem).length).toBe(2);
  });

  it(`should call previewCard method when card name's link clicked`, async () => {
    store = mockStore();
    let spy = jest.spyOn(ActionLogEntryItem.methods, "expandLogCard");
    const wrapper = mount(ActionLog, { store, localVue });

    const entryLogs = wrapper.findAll(ActionLogEntryItem);
    await entryLogs.wrappers[0].find("a").trigger("click");

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

const mockStore = () => {
  return new Vuex.Store({
    modules: {
      card: {
        namespaced: true,
        state: {},
        actions: {},
        getters: {},
      },
      actionLog: {
        namespaced: true,
        state: {
          expanded: true,
        },
        actions: {
          toggleExpanded: () => null,
        },
        getters: {},
      },
      match: {
        namespaced: true,
        match: {},
        actions: {},
        getters: {
          actionLog: () => {
            return {
              queryLatest: () => [
                {
                  action: "expandedStation",
                  count: 1,
                  iconUrl: "/icon/expand.svg",
                  text: "Mr.Roboto expanded station by *1 station card#",
                },
                {
                  action: "played", //Mr.Roboto played <strong><strong>Fast Missile</strong></strong></span>
                  cardIds: ["6:70723"],
                  iconUrl: "/icon/played.svg",
                  text: "Mr.Roboto played **Fast Missile##",
                },
              ],
            };
          },
        },
      },
    },
  });
};
