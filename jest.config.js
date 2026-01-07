/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Solo buscamos tests en src
  roots: ["<rootDir>/src"],

  // Convención de nombres
  testMatch: ["**/__tests__/**/*.test.ts"],

  // No testear node_modules
  testPathIgnorePatterns: ["/node_modules/"],

  // Mejora mensajes de error
  verbose: true,
};
