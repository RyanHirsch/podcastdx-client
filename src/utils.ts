function isDate(d: unknown): d is Date {
  return Object.prototype.hasOwnProperty.call(d, "getUTCMilliseconds");
}

export function toEpochTimestamp(date: number | Date | undefined): number | undefined {
  if (!date) {
    return undefined;
  }

  const ts = isDate(date) ? date.getTime() : date;

  const asDate = new Date(ts);
  if (asDate.getFullYear() > 2003) {
    return Math.floor(ts / 1000);
  }
  return ts;
}

export function normalizeKey<ObjT, KeyT extends keyof ObjT>(
  fn: (ex: ObjT[KeyT]) => ObjT[KeyT],
  key: KeyT,
  obj: ObjT
): ObjT {
  const val = fn(obj[key]);
  return {
    ...obj,
    [key]: val,
  };
}
