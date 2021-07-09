/**
 * @fileoverview this file provides methods handling dependency cache
 */

import { join } from 'path';
import os from 'os';
import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as glob from '@actions/glob';

const STATE_CACHE_PRIMARY_KEY = 'cache-primary-key';
const CACHE_MATCHED_KEY = 'cache-matched-key';

interface PackageManager {
  id: 'maven' | 'gradle';
  path: string[];
  key: () => Promise<string>;
}
const supportedPackageManager: PackageManager[] = [
  {
    id: 'maven',
    path: [join(os.homedir(), '.m2', 'repository')],
    key: async () => {
      return `${process.env['RUNNER_OS']}-maven-${await glob.hashFiles('**/pom.xml')}`;
    }
  },
  {
    id: 'gradle',
    path: [join(os.homedir(), '.gradle', 'caches'), join(os.homedir(), '.gradle', 'wrapper')],
    key: async () => {
      return `${process.env['RUNNER_OS']}-gradle-${await glob.hashFiles(
        '**/*.gradle*\n**/gradle-wrapper.properties'
      )}`;
    }
  }
];

function findPackageManager(id: string): PackageManager {
  const packageManager = supportedPackageManager.find(packageManager => packageManager.id === id);
  if (packageManager === undefined) {
    throw new Error(`unknown package manager specified: ${id}`);
  }
  return packageManager;
}

/**
 * Restore the dependency cache
 * @param id ID of the package manager, should be "maven" or "gradle"
 */
export async function restore(id: string) {
  const packageManager = findPackageManager(id);
  const primaryKey = await packageManager.key();
  core.debug(`primary key is ${primaryKey}`);
  core.saveState(STATE_CACHE_PRIMARY_KEY, primaryKey);

  const matchedKey = await cache.restoreCache(packageManager.path, primaryKey, [
    `${process.env['RUNNER_OS']}-${id}`
  ]);
  if (!matchedKey) {
    core.info(`${packageManager} cache is not found`);
    return;
  }

  core.saveState(CACHE_MATCHED_KEY, matchedKey);
  core.info(`Cache restored from key: ${matchedKey}`);
}

/**
 * Save the dependency cache
 * @param id ID of the package manager, should be "maven" or "gradle"
 */
export async function save(id: string) {
  const packageManager = findPackageManager(id);
  const primaryKey = await packageManager.key();
  const matchedKey = core.getState(CACHE_MATCHED_KEY);
  if (matchedKey === primaryKey) {
    // no change in target directories
    core.info(`Cache hit occurred on the primary key ${primaryKey}, not saving cache.`);
    return;
  }
  try {
    await cache.saveCache(packageManager.path, primaryKey);
    core.info(`Cache saved with the key: ${primaryKey}`);
  } catch (error) {
    if (error.name === cache.ValidationError.name) {
      throw error;
    } else if (error.name === cache.ReserveCacheError.name) {
      core.info(error.message);
    } else {
      core.warning(`${error.message}`);
    }
  }
}
