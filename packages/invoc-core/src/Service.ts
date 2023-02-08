import { IInjectionMediator } from "./InstanceManager";
import { IInjectable, IInjector, Class } from "./types";

abstract class Service implements IInjectable, IInjector {
  private im: IInjectionMediator;
  constructor(im: IInjectionMediator) {
    this.im = im;
  }

  readonly inject = <T extends Class<IInjectable, any>>(store: {
    class: T;
    id: string;
  }) => {
    const im = this.im;
    return {
      get instance() {
        const lookup = im.inject(store.id);
        if (lookup == null) {
          return null;
        }

        return lookup as InstanceType<T>;
      },
    };
  };

  readonly serialize?: () => any;
  readonly deserialize?: (serialized: any) => void;
  readonly onInstanceCreated?: () => void;
  readonly onUnRegister?: () => void;
}

export { Service };
