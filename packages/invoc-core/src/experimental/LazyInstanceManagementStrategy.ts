import { Class, IInjectable } from "../index";
import { InstanceManagementStrategy, IRegistryEntry } from "../InstanceManager";
import { Service } from "../Service";

class EXPERIMENTAL_LazyInstanceManagementStrategy extends InstanceManagementStrategy {
  onRegisterDefinitions(
    definitions: Array<{ id: string; class: Class<IInjectable> }>
  ) {
    for (const definition of definitions) {
      if (this.registry.has(definition.id)) continue;
      const im = this.injectionMediator;
      let instance: IInjectable | null = null;
      const temp: IRegistryEntry = {
        registryDate: new Date(),
        instantiationDate: null,
        get instance() {
          if (instance != null) return instance;
          const defClass = definition.class;
          if (defClass.prototype instanceof Service) {
            instance = new defClass(im);
          } else {
            instance = new defClass();
          }
          this.instantiationDate = new Date();
          return instance;
        },
      };
      this.registry.set(definition.id, temp);
    }
  }

  onUnregisterDefinitions(ids: Array<string>) {
    for (const id of ids) {
      const entry = this.registry.get(id);
      if (!entry) continue;
      if (entry.instance && entry.instance.onUnRegister) {
        entry.instance.onUnRegister();
      }
      this.registry.delete(id);
    }
  }

  onListRegisteredIds() {
    return Array.from(this.registry.keys());
  }

  onDropInstances() {
    this.onUnregisterDefinitions(Array.from(this.registry.keys()));
  }
}

export { EXPERIMENTAL_LazyInstanceManagementStrategy };
