import {
  defineInjectable,
  InstanceManager,
  Eager,
  JSONString,
} from "./InstanceManager";
import { Service } from "./Service";
class TestService extends Service {}
const ServiceDefinition = defineInjectable({
  class: TestService,
  name: "TestService",
});

describe("Service tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("Should create an injectable Service", () => {
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: JSONString,
    });
    im.registerDefinitions([ServiceDefinition]);

    const instance = im.injectInstance(ServiceDefinition.id);
    expect(instance).toBeInstanceOf(TestService);
  });

  it("Should inject registered services", () => {
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: JSONString,
    });
    class Example extends Service {
      test() {
        const a = this.inject(ServiceDefinition);
        return a;
      }
    }
    const ExampleDef = defineInjectable({
      class: Example,
      name: "ExampleService",
    });

    im.registerDefinitions([ServiceDefinition, ExampleDef]);

    const instance = im.injectInstance<Example>(ExampleDef.id);
    expect(instance?.test()).toBeInstanceOf(TestService);
  });

  it("Should throw if injected service is not registerred", () => {
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: JSONString,
    });
    class Example extends Service {
      test() {
        const a = this.inject(ServiceDefinition);
        return a;
      }
    }
    const ExampleDef = defineInjectable({
      class: Example,
      name: "ExampleService",
    });

    im.registerDefinitions([ExampleDef]);
    const helper = () => {
      im.injectInstance<Example>(ExampleDef.id).test();
    };
    expect(helper).toThrow(Error);
  });
});
