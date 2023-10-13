import 'dotenv/config';
import { encode } from 'html-entities';

import parentLogger from './logger.js';

const logger = parentLogger.child({}, { msgPrefix: '[format] ' });

function getYearString(str) {
  return str.substring(0, 4);
}

function format(films, openingText, readMorePosition) {
  // Convert from reverse-chronological (newest to oldest) to chronological order (oldest to newest)
  films.reverse();

  let markdown = openingText;

  const startingYear = getYearString(films[0].watched_at);
  let currentYear = startingYear;
  logger.debug('Set starting year as %s', startingYear);

  films.forEach((item, index) => {
    // Add headings for each year
    const yearWatched = getYearString(item.watched_at);

    if (yearWatched !== currentYear) {
      markdown += `<br><strong id="${yearWatched}">${yearWatched}:</strong>\n`;

      logger.debug('Detected start of new year (%s), added heading', yearWatched);

      currentYear = yearWatched;
    }

    // Add film
    const { movie: { title, year } } = item;
    const safeTitle = encode(title, {
      mode: 'nonAscii', // the é in 'Les Misérables (2012)' seemed to be causing 400 errors frpm Tumblr, this fixes that
      level: 'xml', // 'all', 'html5', and 'html4' don't work and result in incorrect encodings
    });

    markdown += `${index + 1}. ${safeTitle} (${year})\n`;
    // logger.trace('Added %s (%d)', safeTitle, year);

    // Add Tumblr read more comment
    if (index + 1 === readMorePosition) {
      markdown += '<!-- more -->\n';

      logger.debug('Added Tumblr read more link at position %d', readMorePosition);
    }
  });

  return markdown;
}

export default format;
