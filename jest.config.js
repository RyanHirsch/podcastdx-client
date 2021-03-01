module.exports = {
  verbose: true,
  preset: "ts-jest/presets/js-with-ts",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "\\.(tsx?)$": "ts-jest",
  },
  testMatch: ["**/*.test.[tj]s"],
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
};
