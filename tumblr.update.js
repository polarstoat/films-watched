import 'dotenv/config';
import Conf from 'conf';
import tumblr from 'tumblr.js';

import parentLogger from './logger.js';
import { isEqual } from './utility.js';

const logger = parentLogger.child({}, { msgPrefix: '[update] ' });
const config = new Conf({ projectName: 'films-watched' });

const client = new tumblr.Client({
  consumer_key: process.env.TUMBLR_CONSUMER_KEY,
  consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
  token: process.env.TUMBLR_TOKEN,
  token_secret: process.env.TUMBLR_TOKEN_SECRET,
});
logger.trace('Created Tumblr client instance');

async function updatePost(id, body, date) {
  logger.trace('Updating post %s', id);

  // https://www.tumblr.com/docs/en/api/v2#postedit--edit-a-blog-post-legacy
  // https://tumblr.github.io/tumblr.js/classes/tumblr.Client.html#editLegacyPost
  const edit = await client.editLegacyPost(config.get('tumblrBlogName'), {
    id,
    format: 'markdown',
    type: 'text',
    body,
    date: date.toISOString(),
  });

  const expectedReturnValue = {
    id: Number.parseInt(id, 10),
    id_string: id,
  };

  if (!isEqual(edit, expectedReturnValue)) {
    logger.warn(edit, 'Unexpected response from editLegacyPost call');
  }

  logger.info('Updated post %s', id);
}

export default updatePost;
