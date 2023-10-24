import Conf from 'conf';
import Trakt from 'trakt.tv';

import parentLogger from './logger.js';
import { tokenToString, isEqual, validateEnvironmentVariables } from './utility.js';

const logger = parentLogger.child({}, { msgPrefix: '[export] ' });
const config = new Conf({ projectName: 'films-watched' });

const TRAKT_QUERY_LIMIT = 500; // Number of results to return per page

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

const token = config.get('traktToken');

await trakt.import_token(token).then((newToken) => {
  logger.debug('Imported Trakt token %s', tokenToString(token));

  if (!isEqual(token, newToken)) {
    config.set('token', newToken);

    logger.info('Got updated token %s and saved it to the config file', tokenToString(newToken));
  }
});

async function getAllPages(apiMethod) {
  function getPage(page = 1) {
    logger.trace('Getting %s page %d', apiMethod, page);

    return trakt.sync[apiMethod].get({
      type: 'movies',
      pagination: true,
      page,
      limit: TRAKT_QUERY_LIMIT,
    }).then((response) => {
      logger.debug('Got %s page %d (%d items)', apiMethod, page, response.data.length);

      return response;
    }).catch((err) => {
      if (err.code === 'ENOTFOUND') {
        logger.error('Encountered an ENOTFOUND error. Potential cause: no internet connection');
        process.exit(1);
      }

      throw err;
    });
  }

  const firstPage = await getPage();

  const pageCount = parseInt(firstPage.pagination['page-count'], 10);

  logger.debug('Got %s page count: %d (%s total items)', apiMethod, pageCount, firstPage.pagination['item-count']);

  const promises = [firstPage];

  for (let page = 2; page <= pageCount; page += 1) {
    promises.push(getPage(page));
  }

  const allPages = Promise.all(promises);

  return allPages;
}

async function getFilms(source) {
  logger.trace('Exporting Trakt %s', source);

  const resultsAsPages = await getAllPages(source);

  logger.trace('Mapping %s pages into flat array of films', source);
  const films = resultsAsPages.flatMap((page) => page.data);

  logger.info('Exported %d films from Trakt %s', films.length, source);

  return films;
}

export default getFilms;
