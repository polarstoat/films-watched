import Trakt from 'trakt.tv';

import parentLogger from './utils/logger.js';
import validateEnvironmentVariables from './utils/validateEnvironmentVariables.js';

const logger = parentLogger.child({}, { msgPrefix: '[trakt] ' });

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

export { tokenToString };
