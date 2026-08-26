module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  root: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  setupFiles: ["<rootDir>/src/test-setup.ts"],
  clearMocks: true,
}