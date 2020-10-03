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
      tsConfig: "tsconfig.jest.json",
      astTransformers: {
        before: ["ts-jest-keys-transformer.js"],
      },
    },
  },
};
