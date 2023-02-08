import {
  defineInjectable,
  Eager,
  InstanceManager,
  JSONString,
} from "./InstanceManager";
import { Store } from "./Store";
class TestStore extends Store {}
const storeDefinition = defineInjectable({
  class: TestStore,
  name: "testStore",
});

describe("Store tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("Should create an injectable Store", () => {
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: JSONString,
    });
    im.registerDefinitions([storeDefinition]);

    const instance = im.injectInstance(storeDefinition.id);
    expect(instance).toBeInstanceOf(TestStore);
  });
});
