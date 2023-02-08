import { IInjectable } from "./types";

abstract class Store implements IInjectable {
  readonly serialize?: () => string;
  readonly deserialize?: (serialized: string) => void;
  readonly onUnRegister?: () => void;
  readonly onInstanceCreated?: () => void;
}

export { Store };
