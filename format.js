import { encode } from 'html-entities';

import parentLogger from './utils/logger.js';

const logger = parentLogger.child({}, { msgPrefix: '[format] ' });

function getYearString(str) {
  return str.substring(0, 4);
}

function format(films, openingText, readMorePosition) {
  logger.trace('Formatting films as Markdown list');

  let markdown = openingText;
  logger.debug('Added opening text: %s', JSON.stringify(openingText));

  const startingYear = getYearString(films[0].watched_at);
  let currentYear = startingYear;
  logger.debug('Found starting year: %s', startingYear);

  logger.trace('Looping through films');
  films.forEach((item, index) => {
    // Add headings for each year
    const yearWatched = getYearString(item.watched_at);

    if (yearWatched !== currentYear) {
      markdown += `<br><strong id="${yearWatched}">${yearWatched}:</strong>\n`;

      logger.debug('Added year heading: %s', yearWatched);

      currentYear = yearWatched;
    }

    // Add film
    const { movie: { title, year } } = item;
    const safeTitle = encode(title, {
      mode: 'nonAscii', // the é in 'Les Misérables (2012)' seemed to be causing 400 errors frpm Tumblr, this fixes that
      level: 'xml', // 'all', 'html5', and 'html4' don't work and result in incorrect encodings
    });

    markdown += `${index + 1}. ${safeTitle} (${year})\n`;
    // logger.trace('Added film: %s (%d)', safeTitle, year);

    if (typeof readMorePosition !== 'undefined') {
      // Add Tumblr read more comment
      if (index + 1 === readMorePosition) {
        markdown += '<!-- more -->\n';

        logger.debug('Added Tumblr read more link at position %d', readMorePosition);
      }
    }
  });
  logger.trace('Looped through films');

  logger.info('Formatted %d films as Markdown list', films.length);

  return markdown;
}

export default format;
