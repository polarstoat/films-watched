import tumblr from 'tumblr.js';
import { diffLines } from 'diff';

import parentLogger from './utils/logger.js';
import config from './utils/config.js';
import isEqual from './utils/isEqual.js';
import validateEnvironmentVariables from './utils/validateEnvironmentVariables.js';

const logger = parentLogger.child({}, { msgPrefix: '[update] ' });

validateEnvironmentVariables(
  ['TUMBLR_CONSUMER_KEY', 'TUMBLR_CONSUMER_SECRET', 'TUMBLR_TOKEN', 'TUMBLR_TOKEN_SECRET'],
  /^[a-zA-Z\d]{50}$/,
  logger,
);

const client = new tumblr.Client({
  consumer_key: process.env.TUMBLR_CONSUMER_KEY,
  consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
  token: process.env.TUMBLR_TOKEN,
  token_secret: process.env.TUMBLR_TOKEN_SECRET,
});
logger.trace('Created Tumblr client instance');

async function getCurrentPostBody(id) {
  logger.trace('Getting post %s', id);
  const check = await client.blogPosts(config.get('tumblrBlogName'), {
    id,
    filter: 'raw',
  });

  logger.debug('Got post %s', id);

  return check.posts[0].body;
}

async function updatePost(id, body, date) {
  logger.trace('Checking if update of post %s is needed', id);
  const currentPostBody = await getCurrentPostBody(id);

  if (currentPostBody === body) {
    logger.info('No update of post %s needed', id);

    return;
  }

  logger.trace('Update of post %s is needed, detecting changes…', id);

  const changes = diffLines(currentPostBody, body);
  changes.forEach((part) => {
    if (!part.removed && !part.added) {
      logger.trace('%d lines unchanged', part.count);
    } else if (part.added) {
      logger.info('%d lines added: %s', part.count, JSON.stringify(part.value));
    } else if (part.removed) {
      logger.info('%d lines removed: %s', part.count, JSON.stringify(part.value));
    }
  });

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
