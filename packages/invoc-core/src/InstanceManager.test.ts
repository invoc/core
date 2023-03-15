// import { IInjectable } from "./index";
import {
  defineInjectable,
  InstanceManager,
  InstanceManagementStrategy,
  SerializationStrategy,
  Eager,
  JSONString,
} from "./InstanceManager";
// import type { Class } from "./types";
import { Store } from "./Store";
import { Service } from "./Service";
import { mockDeep } from "jest-mock-extended";
import { ILogger } from "./index";

const onRegisterDefinitionsSpy = jest.fn();
const onUnregisterDefinitionsSpy = jest.fn();
const onDropInstancesSpy = jest.fn();
const onListInstanceIdsSpy = jest.fn();
const onInjectInstanceSpy = jest.fn();
class SpyIMStrat extends InstanceManagementStrategy {
  onRegisterDefinitions = onRegisterDefinitionsSpy;
  onUnregisterDefinitions = onUnregisterDefinitionsSpy;
  onDropInstances = onDropInstancesSpy;
  onInjectInstance = onInjectInstanceSpy;
  onListRegisteredIds = onListInstanceIdsSpy;
  onSerialize = onSerializeSpy;
  onDeserialize = onDeserializeSpy;
}

const onSerializeSpy = jest.fn();
const onDeserializeSpy = jest.fn();
class SpySerStrategy extends SerializationStrategy<any> {
  onSerialize = onSerializeSpy;
  onDeserialize = onDeserializeSpy;
}
describe("InstanceManager tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should use the IInstanceManagementStrategy when registerDefinitions", () => {
    const im = new InstanceManager({
      instantiation: SpyIMStrat,
      serialization: SpySerStrategy,
    });
    const arg: any[] = [];
    im.registerDefinitions(arg);
    expect(onRegisterDefinitionsSpy).toHaveBeenCalled();
    expect(onRegisterDefinitionsSpy).toHaveBeenCalledTimes(1);
    expect(onRegisterDefinitionsSpy).toHaveBeenCalledWith(arg);
  });

  it("Should use the IInstanceManagementStrategy instances when drop is called", () => {
    const im = new InstanceManager({
      instantiation: SpyIMStrat,
      serialization: SpySerStrategy,
    });

    im.dropInstances();
    expect(onDropInstancesSpy).toHaveBeenCalled();
    expect(onDropInstancesSpy).toHaveBeenCalledTimes(1);
  });

  it("Should use the IInstanceManagementStrategy when unregisterDefinitions is called ", () => {
    const im = new InstanceManager({
      instantiation: SpyIMStrat,
      serialization: SpySerStrategy,
    });
    im.unregisterDefinitions([]);
    expect(onUnregisterDefinitionsSpy).toHaveBeenCalled();
    expect(onUnregisterDefinitionsSpy).toHaveBeenCalledTimes(1);
    expect(onUnregisterDefinitionsSpy).toHaveBeenCalledWith([]);
  });
  it("Should use the IInstanceManagementStrategy when listRegisteredIds is called ", () => {
    const im = new InstanceManager({
      instantiation: SpyIMStrat,
      serialization: SpySerStrategy,
    });
    im.listRegisteredIds();
    expect(onListInstanceIdsSpy).toHaveBeenCalled();
    expect(onListInstanceIdsSpy).toHaveBeenCalledTimes(1);
  });

  it("Should use the provided SerializationStrategy when serialize is called ", () => {
    const im = new InstanceManager({
      instantiation: SpyIMStrat,
      serialization: SpySerStrategy,
    });
    im.serialize();
    expect(onSerializeSpy).toHaveBeenCalled();
    expect(onSerializeSpy).toHaveBeenCalledTimes(1);
  });

  it("Should use the provided SerializationStrategy when deserialize is called ", () => {
    const im = new InstanceManager({
      instantiation: SpyIMStrat,
      serialization: SpySerStrategy,
    });

    im.deserialize("");
    expect(onDeserializeSpy).toHaveBeenCalled();
    expect(onDeserializeSpy).toHaveBeenCalledTimes(1);
  });

  it("Should inject registered instances", () => {
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: SpySerStrategy,
    });

    class ExampleService extends Service {}
    const esdefinition = defineInjectable({
      name: "example-service",
      class: ExampleService,
    });

    im.registerDefinitions([esdefinition]);

    const t = im.injectInstance<ExampleService>("example-service");
    expect(t).toBeInstanceOf(ExampleService);
  });
  it("Should throw when unknown injectables are requested", () => {
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: SpySerStrategy,
    });
    const helper = () => {
      im.injectInstance("example-service");
    };
    expect(helper).toThrow();
  });
});

describe("Eager Instantiation Strategy tests", () => {
  it("Should instantiante all definitions when onRegisterDefinitions is called", () => {
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: JSONString,
    });
    const storeSpy = jest.fn();
    class TestStore extends Store {
      onInstanceCreated = storeSpy;
    }
    const serviceSpy = jest.fn();

    class TestService extends Service {
      onInstanceCreated = serviceSpy;
    }

    const testStoreDefinition = defineInjectable({
      class: TestStore,
      name: "TestStore",
    });
    const testServiceDefinition = defineInjectable({
      class: TestService,
      name: "TestService",
    });
    im.registerDefinitions([testStoreDefinition, testServiceDefinition]);
    im.registerDefinitions([testStoreDefinition]);
    expect(storeSpy).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledTimes(1);
    expect(serviceSpy).toHaveBeenCalled();
    expect(serviceSpy).toHaveBeenCalledTimes(1);
  });

  it("Should delete all specified instances when onUnregisterDefinitions is called", () => {
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: JSONString,
    });
    const storeSpy = jest.fn();
    class TestStore extends Store {
      onUnRegister = storeSpy;
    }

    const serviceSpy = jest.fn();

    class TestService extends Service {
      onUnRegister = serviceSpy;
    }

    const testStoreDefinition = defineInjectable({
      class: TestStore,
      name: "TestStore",
    });
    const testServiceDefinition = defineInjectable({
      class: TestService,
      name: "TestService",
    });
    im.registerDefinitions([testStoreDefinition, testServiceDefinition]);
    im.unregisterDefinitions(["TestStore", "TestService", ""]);
    expect(storeSpy).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledTimes(1);
    expect(serviceSpy).toHaveBeenCalled();
    expect(serviceSpy).toHaveBeenCalledTimes(1);
  });

  it("Should unregister all instances when onDropInstances is called", () => {
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: JSONString,
    });
    const storeSpy = jest.fn();
    class TestStore extends Store {
      onUnRegister = storeSpy;
    }

    const serviceSpy = jest.fn();

    class TestService extends Service {
      onUnRegister = serviceSpy;
    }

    const testStoreDefinition = defineInjectable({
      class: TestStore,
      name: "TestStore",
    });
    const testServiceDefinition = defineInjectable({
      class: TestService,
      name: "TestService",
    });
    im.registerDefinitions([testStoreDefinition, testServiceDefinition]);
    im.dropInstances();
    expect(storeSpy).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledTimes(1);
    expect(serviceSpy).toHaveBeenCalled();
    expect(serviceSpy).toHaveBeenCalledTimes(1);
    expect(im.listRegisteredIds()).toHaveLength(0);
  });

  it("Should list all instance ids when onListRegisteredIds is called", () => {
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: JSONString,
    });

    const storeSpy = jest.fn();
    class TestStore extends Store {
      cleanUp = storeSpy;
    }

    const serviceSpy = jest.fn();

    class TestService extends Service {
      cleanUp = serviceSpy;
    }

    const testStoreDefinition = defineInjectable({
      class: TestStore,
      name: "TestStore",
    });
    const testServiceDefinition = defineInjectable({
      class: TestService,
      name: "TestService",
    });
    im.registerDefinitions([testStoreDefinition, testServiceDefinition]);
    const ids = im.listRegisteredIds();
    expect(ids).toContain(testStoreDefinition.id);
    expect(ids).toContain(testServiceDefinition.id);
    expect(ids).toHaveLength(2);
  });

  it("Should warn when duplicate names are registered", () => {
    const logger = mockDeep<ILogger>();
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: JSONString,
      logger,
    });

    class TestStore extends Store {}

    class TestService extends Service {}

    const testStoreDefinition = defineInjectable({
      class: TestStore,
      name: "duplicate",
    });
    const testServiceDefinition = defineInjectable({
      class: TestService,
      name: "duplicate",
    });

    im.registerDefinitions([testStoreDefinition, testServiceDefinition]);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("Should warn when unknown instances are unregistered", () => {
    const logger = mockDeep<ILogger>();
    const im = new InstanceManager({
      instantiation: Eager,
      serialization: JSONString,
      logger,
    });

    im.unregisterDefinitions(["test"]);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});

describe("JSONString Serialization strategy tests", () => {
  it("Should serialize all instances when onSerialize is called", () => {
    const im = new InstanceManager<string>({
      instantiation: Eager,
      serialization: JSONString,
    });
    const storeValue = "store value";
    const storeKey = "store";
    const storeSpy = jest.fn(() => storeValue);
    class TestStore extends Store {
      serialize = storeSpy;
    }
    const serviceValue = "service value";
    const serviceSpy = jest.fn(() => serviceValue);
    const serviceKey = "service";
    class TestService extends Service {
      serialize = serviceSpy;
    }

    class NoSerialize extends Service {}

    const testStoreDefinition = defineInjectable({
      class: TestStore,
      name: storeKey,
    });
    const testServiceDefinition = defineInjectable({
      class: TestService,
      name: serviceKey,
    });
    const noSerializeDefinition = defineInjectable({
      class: NoSerialize,
      name: "no-serialize",
    });
    im.registerDefinitions([
      testStoreDefinition,
      testServiceDefinition,
      noSerializeDefinition,
    ]);
    const ans = im.serialize();
    expect(im.listRegisteredIds()).toHaveLength(3);
    // spys were called
    expect(storeSpy).toHaveBeenCalledTimes(1);
    expect(serviceSpy).toHaveBeenCalledTimes(1);
    // expected keys and values from serialized string
    const ob: { [key: string]: string } = JSON.parse(ans);
    expect(ob).toStrictEqual({
      [serviceKey]: serviceValue,
      [storeKey]: storeValue,
    });
  });

  it("Should deserialize all instances when onDeserialize is called", () => {
    const im = new InstanceManager<string>({
      instantiation: Eager,
      serialization: JSONString,
    });
    const storeValue = "store value";
    const storeKey = "store";
    const storeSpy = jest.fn();

    class TestStore extends Store {
      deserialize = storeSpy;
    }
    const serviceValue = JSON.stringify({ hello: "world" });
    const serviceSpy = jest.fn();
    const serviceKey = "service";

    class TestService extends Service {
      deserialize = serviceSpy;
    }

    class NoDeserialize extends Service {}
    const noserializekeySpy = jest.fn();
    class NoSerializeKey extends Service {
      deserialize = noserializekeySpy;
    }

    const testStoreDefinition = defineInjectable({
      class: TestStore,
      name: storeKey,
    });
    const testServiceDefinition = defineInjectable({
      class: TestService,
      name: serviceKey,
    });
    const noDeserializeDefinition = defineInjectable({
      class: NoDeserialize,
      name: "no-deserialize",
    });

    const noDeserializeKey = defineInjectable({
      class: NoSerializeKey,
      name: "no-key",
    });

    const serializedState = JSON.stringify({
      [serviceKey]: serviceValue,
      [storeKey]: storeValue,
    });
    im.registerDefinitions([
      testStoreDefinition,
      testServiceDefinition,
      noDeserializeDefinition,
      noDeserializeKey,
    ]);
    im.deserialize(serializedState);
    expect(serviceSpy).toHaveBeenCalledTimes(1);
    expect(serviceSpy).toHaveBeenCalledWith(serviceValue);
    expect(storeSpy).toHaveBeenCalledTimes(1);
    expect(storeSpy).toHaveBeenCalledWith(storeValue);
    expect(noserializekeySpy).not.toHaveBeenCalled();
  });
});
describe("InjectionMediator tests", () => {
  it("Should inject instances", () => {
    const im = new InstanceManager<string>({
      instantiation: Eager,
      serialization: JSONString,
    });
    const storeSpy = jest.fn();
    class TestStore extends Store {
      onInstanceCreated = storeSpy;
      value = 2;
    }
    const serviceSpy = jest.fn();

    class TestService extends Service {
      onInstanceCreated = serviceSpy;
      store = this.inject(testStoreDefinition);
    }

    const testStoreDefinition = defineInjectable({
      class: TestStore,
      name: "test-store",
    });
    const testServiceDefinition = defineInjectable({
      class: TestService,
      name: "test-service",
    });
    im.registerDefinitions([testStoreDefinition, testServiceDefinition]);
    const service = im.injectInstance<TestService>(testServiceDefinition.id);

    // known store should be an instance
    expect(service?.store).not.toBe(null);
    expect(service?.store.value).toBe(2);
  });
  it("Shoud throw when injecting an unknown injectable", () => {
    const im = new InstanceManager<string>({
      instantiation: Eager,
      serialization: JSONString,
    });
    const storeSpy = jest.fn();
    class TestStore extends Store {
      onInstanceCreated = storeSpy;
      value = 2;
    }
    const serviceSpy = jest.fn();

    class TestService extends Service {
      onInstanceCreated = serviceSpy;
      store = this.inject(testStoreDefinition);
    }

    const testStoreDefinition = defineInjectable({
      class: TestStore,
      name: "test-store",
    });
    const testServiceDefinition = defineInjectable({
      class: TestService,
      name: "test-service",
    });
    const helper = () => {
      im.registerDefinitions([testServiceDefinition]);
    };
    expect(helper).toThrow();
  });
});
