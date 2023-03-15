/**
 * Classes that implment IInstantiable can be cleaned up, although javascript doens't support
 * reclaiming memory, this method is useful to remove all references to objects that can cause memory
 * leaks or clean up other side effects,
 */
export interface IInstantiable {
  /**
   * Clean up function
   */
  cleanUp(): void;
}

interface ISubscriber<T> {
  update(nextValue: T): void;
  clearCallback(): void;
}

interface ISubbable<T> {
  /**
   * Register an subscriber and return the observer ID
   */
  subscribe(args: { id: Symbol; instance: ISubscriber<T> }): boolean;

  /**
   * Removes the observer from the observables list
   */
  unsubscribe(id: Symbol): boolean;
  /**
   * Removes the observer from the observables list
   */
  notify(omitObservers?: Array<Symbol>): void;

  clearSubscribers(): void;
}

interface IEncapsulated<T> {
  getValue(): T;
  setValue(value: T): void;
}

interface Ilookup<T, V> {
  lookup(id: V): T | null;
}

interface IInjector {
  inject(id: {
    id: string;
    class: Class<IInjectable>;
  }): InstanceType<Class<IInjectable>>;
}

interface IInjectable {
  readonly serialize?: () => any;
  readonly deserialize?: (serialized: any) => void;
  readonly onUnRegister?: () => void;
  readonly onInstanceCreated?: () => void;
}

type Class<I, Args extends any[] = any[]> = new (...args: Args) => I;

type LoggerType = (...data: any[]) => void;

interface ILogger {
  log: LoggerType;
  warn: LoggerType;
  error: LoggerType;
  info: LoggerType;
}

export type {
  ISubbable,
  IEncapsulated,
  Ilookup,
  ISubscriber,
  IInjector,
  IInjectable,
  Class,
  LoggerType,
  ILogger,
};
