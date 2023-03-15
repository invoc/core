import { Service } from "./Service";
import { IInjectable, Class, ILogger } from "./types";
interface IInstanceManager<S = any> {
  registerDefinitions(
    args: Array<InjectableDefinition<Class<IInjectable>>>
  ): void;
  unregisterDefinitions(id: Array<string>): void;
  injectInstance<S extends InstanceType<Class<IInjectable>>>(id: string): S;
  dropInstances(): void;
  listRegisteredIds(): Array<string>;
  serialize(): S;
  deserialize(serialized: S): void;
}

type InjectableRegistry = Map<string, IRegistryEntry>;

type StrategyArgs = { registry: InjectableRegistry; logger: ILogger | null };
abstract class InstanceManagementStrategy {
  protected injectionMediator: InjectionMediator;
  protected registry: InjectableRegistry;
  protected logger: ILogger | null;
  constructor(args: StrategyArgs) {
    this.registry = args.registry;
    this.logger = args.logger;
    this.injectionMediator = new InjectionMediator(this.registry);
  }
  abstract onRegisterDefinitions(
    args: Array<{ id: string; class: Class<IInjectable> }>
  ): void;
  abstract onUnregisterDefinitions(id: Array<string>): void;
  abstract onDropInstances(): void;
  abstract onListRegisteredIds(): Array<string>;
}
abstract class SerializationStrategy<T> {
  protected registry: InjectableRegistry;
  protected logger: ILogger | null;
  constructor(args: StrategyArgs) {
    this.registry = args.registry;
    this.logger = args.logger;
  }
  abstract onSerialize(): T;
  abstract onDeserialize(content: T): void;
}
interface IRegistryEntry {
  instance: IInjectable | null;
  registryDate: Date;
  instantiationDate: Date | null;
}
class JSONString extends SerializationStrategy<string> {
  onSerialize() {
    const ob: { [key: string]: any } = {};
    for (const [id, entry] of this.registry.entries()) {
      if (!entry.instance || !entry.instance.serialize) {
        continue;
      }
      ob[id] = entry.instance.serialize();
    }
    return JSON.stringify(ob);
  }
  onDeserialize(value: any) {
    const parsed = JSON.parse(value);
    for (const [id, entry] of this.registry.entries()) {
      if (!entry.instance || !entry.instance.deserialize) {
        continue;
      }
      if (parsed[id] == null) {
        continue;
      }
      entry.instance.deserialize(parsed[id]);
    }
  }
}
class Eager extends InstanceManagementStrategy {
  onRegisterDefinitions(
    definitions: Array<{ id: string; class: Class<IInjectable, any> }>
  ) {
    for (const definition of definitions) {
      if (this.registry.has(definition.id)) {
        this.logger &&
          this.logger.warn(
            `@invoc/core | Injectable with id: ${definition.id} already exists. Please consider a using unique ids.`
          );
        continue;
      }
      let instance: IInjectable | null = null;
      const defClass = definition.class;
      if (defClass.prototype instanceof Service) {
        instance = new defClass(this.injectionMediator);
      } else {
        instance = new defClass();
      }
      if (instance.onInstanceCreated) {
        instance.onInstanceCreated();
      }

      const now = new Date();
      this.registry.set(definition.id, {
        instance,
        instantiationDate: now,
        registryDate: now,
      });
    }
  }

  onUnregisterDefinitions(ids: Array<string>) {
    for (const id of ids) {
      const entry = this.registry.get(id);
      if (!entry || !entry.instance) {
        this.logger &&
          this.logger.warn(
            `@invoc/core | Injectable with id: ${id} does not exist. No action will be taken`
          );
        continue;
      }
      if (entry.instance.onUnRegister) {
        entry.instance.onUnRegister();
      }
      this.registry.delete(id);
    }
  }

  onDropInstances() {
    this.onUnregisterDefinitions(Array.from(this.registry.keys()));
  }

  onListRegisteredIds() {
    return Array.from(this.registry.keys());
  }
}

export interface IInjectionMediator {
  inject(id: string): IInjectable;
}

class InjectionMediator implements IInjectionMediator {
  private registry!: InjectableRegistry;
  constructor(registry: InjectableRegistry) {
    this.registry = registry;
  }
  public inject(id: string) {
    const res = this.registry.get(id);
    if (res == null || res.instance == null) {
      throw new Error(
        `Could not find instance to inject ${id}, make sure its registered.`
      );
    }

    return res.instance;
  }
}

class InstanceManager<S = any> implements IInstanceManager<S> {
  private instanceManagementStrategy!: InstanceManagementStrategy;
  private serializationStrategy!: SerializationStrategy<S>;
  private registry: InjectableRegistry = new Map();
  private logger: ILogger | null = null;

  constructor(args: {
    instantiation: Class<InstanceManagementStrategy, [StrategyArgs]>;
    serialization: Class<SerializationStrategy<S>, [StrategyArgs]>;
    logger?: ILogger;
  }) {
    this.logger = args.logger ?? null;

    this.instanceManagementStrategy = new args.instantiation({
      registry: this.registry,
      logger: this.logger,
    });
    this.serializationStrategy = new args.serialization({
      registry: this.registry,
      logger: this.logger,
    });
  }

  registerDefinitions(
    definitions: Array<InjectableDefinition<Class<IInjectable>>>
  ) {
    return this.instanceManagementStrategy.onRegisterDefinitions(definitions);
  }

  unregisterDefinitions(ids: Array<string>) {
    this.instanceManagementStrategy.onUnregisterDefinitions(ids);
  }

  injectInstance<S extends InstanceType<Class<IInjectable>>>(id: string) {
    const res = this.registry.get(id);
    if (res == null || res.instance == null) {
      throw new Error(
        `Could not find instance to inject ${id}, make sure its registered.`
      );
    }
    return res.instance as S;
  }

  dropInstances() {
    this.instanceManagementStrategy.onDropInstances();
  }

  listRegisteredIds() {
    return this.instanceManagementStrategy.onListRegisteredIds();
  }

  serialize() {
    return this.serializationStrategy.onSerialize();
  }

  deserialize(serialized: S) {
    this.serializationStrategy.onDeserialize(serialized);
  }
}

type InjectableDefinition<T extends Class<IInjectable>> = {
  id: string;
  class: T;
};

const defineInjectable = <T extends Class<IInjectable>>(args: {
  name: string;
  class: T;
}): InjectableDefinition<T> => {
  return {
    id: args.name,
    class: args.class,
  };
};

export {
  InstanceManager,
  Eager,
  IInstanceManager,
  InjectionMediator,
  JSONString,
  InstanceManagementStrategy,
  SerializationStrategy,
  IRegistryEntry,
  defineInjectable,
  InjectableDefinition,
  InjectableRegistry,
};
