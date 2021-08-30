/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov'],
  globals: {
    __SERVER__: true,
    __DEV__: false,
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/jest/__mocks__/file-mock.js',
    '\\.(svg)$': '<rootDir>/jest/__mocks__/svgr-mock.js',
    '\\.(css|less|scss|sss|styl)$': '<rootDir>/jest/__mocks__/style-mock.js',
    '\\.module.(css|less|scss|sss|styl)$': 'identity-obj-proxy',
  },
  modulePathIgnorePatterns: ['<rootDir>/.history'],
  setupFilesAfterEnv: ['<rootDir>/jest/setup-test.js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(jsx?)$': 'babel-jest',
  },
};