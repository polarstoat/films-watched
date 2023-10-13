import 'dotenv/config';
import Conf from 'conf';
import Trakt from 'trakt.tv';

import parentLogger from './logger.js';
import { tokenToString } from './utility.js';

const logger = parentLogger.child({}, { msgPrefix: '[auth] ' });

const config = new Conf({ projectName: 'films-watched' });

const trakt = new Trakt({
  client_id: process.env.TRAKT_CLIENT_ID,
  client_secret: process.env.TRAKT_CLIENT_SECRET,
});

await trakt.get_codes().then((poll) => {
  logger.debug('get_codes() response: %o', poll);

  logger.info('Authenticate this device with the code %s at %s', poll.user_code, poll.verification_url);

  return trakt.poll_access(poll);
}).then((resp) => {
  logger.debug('poll_access() response: %o', resp);

  const token = trakt.export_token();

  config.set('traktToken', token);

  logger.info('Got token %s', tokenToString(token));
});
