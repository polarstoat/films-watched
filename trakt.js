import path from 'node:path';

import Trakt from 'trakt.tv';
import envPaths from 'env-paths';
import { writeJsonFile } from 'write-json-file';
import { loadJsonFile } from 'load-json-file';

import parentLogger from './utils/logger.js';
import validateEnvironmentVariables from './utils/validateEnvironmentVariables.js';

const logger = parentLogger.child({}, { msgPrefix: '[trakt] ' });

const paths = envPaths('films-watched');
const tokenPath = path.join(paths.data, 'traktToken.json');

validateEnvironmentVariables(
  ['TRAKT_CLIENT_ID', 'TRAKT_CLIENT_SECRET'],
  /^[a-f\d]{64}$/i,
  logger,
);

const trakt = new Trakt({
  client_id: process.env.TRAKT_CLIENT_ID,
  client_secret: process.env.TRAKT_CLIENT_SECRET,
});
logger.trace('Created Trakt client instance');

export default trakt;

function tokenToString(t) {
  return `${t.access_token.substring(0, 8)}… (expires ${new Date(t.expires).toUTCString()})`;
}

async function saveToken(token) {
  logger.trace('Saving token %s to "%s"', tokenToString(token), tokenPath);

  await writeJsonFile(tokenPath, token);

  logger.debug('Saved token %s to "%s"', tokenToString(token), tokenPath);
}

async function loadToken() {
  logger.trace('Loading token from "%s"', tokenPath);

  const token = await loadJsonFile(tokenPath);

  logger.debug('Loaded token %s', tokenToString(token));

  return token;
}

export {
  tokenToString,
  saveToken,
  loadToken,
};
