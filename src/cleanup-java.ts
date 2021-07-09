import * as core from '@actions/core';
import * as gpg from './gpg';
import * as constants from './constants';
import { save } from './cache';

async function removePrivateKeyFromKeychain() {
  if (core.getInput(constants.INPUT_GPG_PRIVATE_KEY, { required: false })) {
    core.info('Removing private key from keychain');
    try {
      const keyFingerprint = core.getState(constants.STATE_GPG_PRIVATE_KEY_FINGERPRINT);
      await gpg.deleteKey(keyFingerprint);
    } catch (error) {
      core.setFailed('Failed to remove private key');
    }
  }
}

async function saveCache() {
  const cache = core.getInput(constants.INPUT_CACHE);
  return cache ? save(cache) : Promise.resolve();
}

async function run() {
  await Promise.all([removePrivateKeyFromKeychain(), saveCache()]);
}

run();
