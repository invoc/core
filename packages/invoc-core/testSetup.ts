import "setimmediate";
import dotenv from "dotenv";
import { resolve } from "path";

console.error = () => {};

// Enable ReactDOM act for unit testing
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Implement jest failure function
global.fail = (reason: string) => {
  throw new Error(reason);
};

// Implement jest failure function
dotenv.config({ path: resolve(__dirname, "./config.env.test") });
