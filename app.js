import 'dotenv/config';

import logger from './utils/logger.js';
import config from './utils/config.js';

import getFilms from './trakt.export.js';
import format from './format.js';
import updatePost from './tumblr.update.js';

const syncs = config.get('syncs');

syncs.forEach(async ({
  traktAPIMethod: apiMethod,
  tumblrPostID: postID,
  formattingOptions = {},
}) => {
  logger.info('Synchronising Tumblr post %s with Trakt %s', postID, apiMethod);

  const films = await getFilms(apiMethod);

  const postBody = format(films, formattingOptions);

  await updatePost(
    postID,
    postBody,
    new Date(films.at(-1).watched_at), // Use the date the most recently watched film was watched at
  );
});
