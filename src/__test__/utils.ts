export function assertObjectHasProperties<T>(properties: string[], object: T): void {
  expect(Object.keys(object)).toHaveLength(properties.length);
  properties.forEach((prop) => expect(object).toHaveProperty(prop));
}

export function assertObjectsHaveProperties<T>(properties: string[], objects: T[]): void {
  objects.forEach((obj) => assertObjectHasProperties(properties, obj));
}
