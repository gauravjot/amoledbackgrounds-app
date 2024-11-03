import {NativeModulesProxy, EventEmitter, Subscription} from "expo-modules-core";

// Import the native module. On web, it will be resolved to ErrorLogger.web.ts
// and on native platforms to ErrorLogger.ts
import ErrorLoggerModule from "./src/ErrorLoggerModule";
import {ChangeEventPayload, ErrorLoggerViewProps} from "./src/ErrorLogger.types";

// Get the native constant value.
export const PI = ErrorLoggerModule.PI;

export function hello(): string {
  return ErrorLoggerModule.hello();
}

export async function setValueAsync(value: string) {
  return await ErrorLoggerModule.setValueAsync(value);
}

const emitter = new EventEmitter(ErrorLoggerModule ?? NativeModulesProxy.ErrorLogger);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>("onChange", listener);
}

export {ErrorLoggerViewProps, ChangeEventPayload};
