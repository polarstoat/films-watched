import parentLogger from './utils/logger.js';
import config from './utils/config.js';

import trakt, { tokenToString } from './trakt.js';

const logger = parentLogger.child({}, { msgPrefix: '[auth] ' });

await trakt.get_codes().then((poll) => {
  logger.debug(poll, 'Got OAuth codes from Trakt');

  logger.info('Authenticate this device with the code %s at %s', poll.user_code, poll.verification_url);

  return trakt.poll_access(poll);
}).then((resp) => {
  logger.debug('poll_access() response: %o', resp);

  const token = trakt.export_token();

  config.set('traktToken', token);

  logger.info('Got token %s and saved it to the config file', tokenToString(token));
});
