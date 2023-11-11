import { encode } from 'html-entities';

import parentLogger from './utils/logger.js';

const logger = parentLogger.child({}, { msgPrefix: '[format] ' });

function getYearString(str) {
  return str.substring(0, 4);
}

/**
 * Encodes everything outiside of the ASCII printable characters, whilst keeping HTML special
 * characters intact, using HTML4 named references
 *
 * Without this, characters like the 'é' in 'Les Misérables (2012)' caused 400 errors from Tumblr
 *
 * @see https://www.npmjs.com/package/html-entities?activeTab=readme#usage
 * @see https://en.wikipedia.org/wiki/ASCII#Printable_characters
 *
 * @param  {string} dirtyString The string to be encoded
 * @return {string}             The sanitised (encoded) string
 */
function sanitise(dirtyString) {
  const cleanString = encode(dirtyString, {
    mode: 'nonAsciiPrintableOnly',
    level: 'html4',
  });

  // if (cleanString !== dirtyString) {
  //   logger.trace('Encoded %s as %s', JSON.stringify(dirtyString), JSON.stringify(cleanString));
  // }

  return cleanString;
}

function format(films, {
  textBefore = '',
  textAfter = '',
  includeYearHeadings = false,
  tumblrTruncateAfter = null,
}) {
  logger.trace('Formatting films as Markdown list');

  let markdown = '';

  if (textBefore) {
    markdown += sanitise(textBefore);
    logger.debug('Added opening text: %s', JSON.stringify(textBefore));
  }

  const startingYear = getYearString(films[0].watched_at);
  let currentYear = startingYear;
  logger.debug('Found starting year: %s', startingYear);

  logger.trace('Looping through films');
  films.forEach((item, index) => {
    // Add headings for each year
    if (includeYearHeadings === true) {
      const yearWatched = getYearString(item.watched_at);

      if (yearWatched !== currentYear) {
        markdown += `<br><strong id="${yearWatched}">${yearWatched}:</strong>\n`;

        logger.debug('Added year heading: %s', yearWatched);

        currentYear = yearWatched;
      }
    }

    // Add film
    const { movie: { title, year } } = item;

    const safeTitle = sanitise(title);

    markdown += `${index + 1}. ${safeTitle} (${year})\n`;
    // logger.trace('Added film: %s (%d)', safeTitle, year);

    if (typeof tumblrTruncateAfter !== 'undefined') {
      // Add Tumblr read more comment
      if (index + 1 === tumblrTruncateAfter) {
        markdown += '<!-- more -->\n';

        logger.debug('Added Tumblr read more link at position %d', tumblrTruncateAfter);
      }
    }
  });
  logger.trace('Looped through films');

  if (textAfter) {
    markdown += sanitise(textAfter);
    logger.debug('Added closing text: %s', JSON.stringify(textAfter));
  }

  logger.info('Formatted %d films as Markdown list', films.length);

  return markdown;
}

export default format;
