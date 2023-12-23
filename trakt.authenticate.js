import 'dotenv/config';

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
}).catch((err) => {
  if (err.code === 'ENOTFOUND') {
    logger.error('Encountered an ENOTFOUND error. Potential cause: no internet connection');
    process.exit(1);
  } else if (err.code === 'EAI_AGAIN') {
    logger.error('Encountered an EAI_AGAIN error. Potential cause: temporary DNS failure');
    process.exit(1);
  } else if (err.message === 'Expired') {
    logger.error('Code expired. Run script again to generate a new code');
    process.exit(1);
  }

  throw err;
});
