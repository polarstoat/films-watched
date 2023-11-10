import { encode } from 'html-entities';

import parentLogger from './utils/logger.js';

const logger = parentLogger.child({}, { msgPrefix: '[format] ' });

function getYearString(str) {
  return str.substring(0, 4);
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
    markdown += textBefore;
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

    // the é in 'Les Misérables (2012)' seemed to be causing 400 errors from Tumblr, this fixes that
    const safeTitle = encode(title, {
      /*
      'specialChars' doesn't encode problem characters
      'extensive' encodes many unnecesarry characters (like commas)
      'nonAscii' encodes ampersands, which isn't necessary
      'nonAsciiPrintable' encodes ampersands and apostrophes, again not needed
      'nonAsciiPrintableOnly' seems to get just the problem characters: ½, é, ·, ä, ʻ, ☆, à, …
       */
      mode: 'nonAsciiPrintableOnly',
      /*
      'all' (alias of 'html5') results in '&half;', '&star;', and '&mldr;' showing up as text
      'xml' and 'html4' both display correctly on Tumblr
       */
      level: 'html4',
    });
    // if (safeTitle !== title) logger.trace('Encoded "%s" as "%s"', title, safeTitle);

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
    markdown += textAfter;
    logger.debug('Added closing text: %s', JSON.stringify(textAfter));
  }

  logger.info('Formatted %d films as Markdown list', films.length);

  return markdown;
}

export default format;
