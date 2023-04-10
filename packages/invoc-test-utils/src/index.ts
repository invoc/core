import type { InjectableRegistry, IInjectionMediator } from "@invoc/core";

class TestInjectionMediator implements IInjectionMediator {
  public readonly registry: InjectableRegistry = new Map();

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

const createTestMediator = () => new TestInjectionMediator();

export { createTestMediator };
export type { TestInjectionMediator };
