module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.(ts|js)$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/", "/dist/"],
  forceExit: true,
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  globalSetup: "<rootDir>/tests/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/globalTeardown.ts",
};
