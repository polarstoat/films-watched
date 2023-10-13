import 'dotenv/config';
import Conf from 'conf';
import tumblr from 'tumblr.js';

import parentLogger from './logger.js';

const logger = parentLogger.child({}, { msgPrefix: '[update] ' });
const config = new Conf({ projectName: 'films-watched' });

const client = new tumblr.Client({
  consumer_key: process.env.TUMBLR_CONSUMER_KEY,
  consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
  token: process.env.TUMBLR_TOKEN,
  token_secret: process.env.TUMBLR_TOKEN_SECRET,
});

async function updatePost(id, body, date) {
  // https://www.tumblr.com/docs/en/api/v2#postedit--edit-a-blog-post-legacy
  // https://tumblr.github.io/tumblr.js/classes/tumblr.Client.html#editLegacyPost
  const edit = await client.editLegacyPost(config.get('tumblrBlogName'), {
    id,
    format: 'markdown',
    type: 'text',
    body,
    date: date.toISOString(),
  });
  logger.debug(edit, 'Edited post %s', id);

  const expectedReturnValue = {
    id: Number.parseInt(id, 10),
    id_string: id,
  };

  if (JSON.stringify(edit) !== JSON.stringify(expectedReturnValue)) {
    logger.warn(expectedReturnValue, 'Response of edit did not match expected return value');
  }
}

export default updatePost;
