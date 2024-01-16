import parentLogger from './utils/logger.js';
import config from './utils/config.js';
import isEqual from './utils/isEqual.js';

import trakt, { tokenToString } from './trakt.js';

const logger = parentLogger.child({}, { msgPrefix: '[export] ' });

const TRAKT_QUERY_LIMIT = 500; // Number of results to return per page

const token = config.get('traktToken');

await trakt.import_token(token).then((newToken) => {
  logger.debug('Imported Trakt token %s', tokenToString(token));

  if (!isEqual(token, newToken)) {
    config.set('traktToken', newToken);

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
      } else if (err.code === 'EAI_AGAIN') {
        logger.error('Encountered an EAI_AGAIN error. Potential cause: temporary DNS failure');
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

  if (source === 'history') {
    // Convert from reverse-chronological (newest first) to chronological order (oldest first)
    films.reverse();
    logger.debug('Reversed order of films array for %s API method (newest first → oldest first)', source);
  }

  logger.info('Exported %d films from Trakt %s', films.length, source);

  return films;
}

export default getFilms;
