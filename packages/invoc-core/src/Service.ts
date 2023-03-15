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
    return this.im.inject(store.id) as InstanceType<T>;
  };

  readonly serialize?: () => any;
  readonly deserialize?: (serialized: any) => void;
  readonly onInstanceCreated?: () => void;
  readonly onUnRegister?: () => void;
}

export { Service };
