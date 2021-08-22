// https://kulshekhar.github.io/ts-jest/docs/getting-started/presets#advanced
const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    ...tsjPreset.transform,
  },
  verbose: true
}