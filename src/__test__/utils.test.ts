import { toEpochTimestamp } from "../utils";

describe("utilities", () => {
  describe("toEpochTimestamp", () => {
    const epoch = 1601772162;

    it("leaves existing epoch timestamp alone", () => {
      expect(toEpochTimestamp(epoch)).toEqual(epoch);
    });

    it("converts a date object to epoch timestamp", () => {
      const date = new Date(epoch * 1000);
      expect(toEpochTimestamp(date)).toEqual(epoch);
    });

    it("converts js timestamp", () => {
      const date = new Date(epoch * 1000);
      expect(toEpochTimestamp(date.getTime())).toEqual(epoch);
    });
  });
});
