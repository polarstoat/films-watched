import 'dotenv/config';
import Conf from 'conf';

import logger from './logger.js';
import getFilms from './trakt.export.js';
import format from './format.js';
import updatePost from './tumblr.update.js';

const config = new Conf({ projectName: 'films-watched' });

const syncs = config.get('syncs');

syncs.forEach(async (sync) => {
  logger.debug(sync, 'Found sync object in config file');

  const films = await getFilms(sync.traktAPIMethod);

  const markdown = format(films, sync.startingText, sync.tumblrReadMoreLinkPosition);

  await updatePost(
    sync.tumblrPostID,
    markdown,
    new Date(films.at(-1).watched_at), // Use the date the most recently watched film was watched at
  );
});
