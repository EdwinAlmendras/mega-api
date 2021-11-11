export * from "./core"



// let newObj = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v * v]));
export function objMap(obj, func) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, func(v)]));
  }
  