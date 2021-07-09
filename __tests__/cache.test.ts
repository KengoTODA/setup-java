import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { restore, save } from '../src/cache';

describe('dependency cache', () => {
  const OLD_RUNNER_OS = process.env['RUNNER_OS'];
  const OLD_GITHUB_WORKSPACE = process.env['GITHUB_WORKSPACE'];
  beforeEach(() => {
    const tmpDir = join(tmpdir(), 'setup-java-cache-');
    mkdtempSync(tmpDir);
    process.env['GITHUB_WORKSPACE'] = tmpDir;
    process.env['RUNNER_OS'] = 'Linux';
  });
  afterEach(() => {
    process.env['GITHUB_WORKSPACE'] = OLD_GITHUB_WORKSPACE;
    process.env['RUNNER_OS'] = OLD_RUNNER_OS;
  });

  describe('restore', () => {
    it('throws error if unsupported package manager specified', () => {
      expect(restore('ant')).rejects.toThrowError('unknown package manager specified: ant');
    });
  });
  describe('save', () => {
    it('throws error if unsupported package manager specified', () => {
      expect(save('ant')).rejects.toThrowError('unknown package manager specified: ant');
    });
  });
});
