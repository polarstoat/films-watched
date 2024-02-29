import path from 'node:path';

import envPaths from 'env-paths';
import { writeJsonFile } from 'write-json-file';
import { loadJsonFile } from 'load-json-file';

import parentLogger from './utils/logger.js';

import trakt from './trakt.js';

const logger = parentLogger.child({}, { msgPrefix: '[activity] ' });

// Mapping of Trakt API methods to their relevant last activity key
const ACTIVITY_KEYS = {
  history: 'watched_at',
  watchlist: 'watchlisted_at',
};

const paths = envPaths('films-watched');
const cachePath = path.join(paths.cache, 'lastActivities.json');

async function getCache(filePath) {
  try {
    logger.trace('Loading cache from "%s"', filePath);
    const cache = await loadJsonFile(filePath);

    logger.debug(cache, 'Loaded cache');

    return cache;
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.warn('No cache at "%s" found', filePath);

      return undefined;
    }

    throw err;
  }
}

async function shouldUpdate(apiMethod) {
  // Get cached last activities (if it exists)
  const cache = await getCache(cachePath);

  // Get last activities from Trakt
  logger.trace('Getting last activities from Trakt');
  const lastActivities = await trakt.sync.last_activities();

  logger.debug(lastActivities, 'Got last activities from Trakt');

  // If there is no cache, or the cached version is not up to date
  if (!cache || cache.all !== lastActivities.all) {
    logger.trace('Saving last activities to cache at "%s"', cachePath);
    await writeJsonFile(cachePath, lastActivities);

    logger.trace('Saved last activities to cache at "%s"', cachePath);
  }

  const key = ACTIVITY_KEYS[apiMethod];
  if (!key) {
    logger.error('Invalid API method in config: "%s"', apiMethod);
    process.exit(1);
  }

  if (!cache || new Date(cache.movies[key]) < new Date(lastActivities.movies[key])) {
    return true;
  }

  return false;
}

export default shouldUpdate;
