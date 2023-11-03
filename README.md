# Films watched

![Project version](https://img.shields.io/github/package-json/v/polarstoat/films-watched) ![Minimum Node.js version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fpolarstoat%2Ffilms-watched%2Fmain%2Fpackage.json&query=%24.engines.node&label=node&color=brightgreen) [![License](https://img.shields.io/github/license/polarstoat/films-watched)](https://github.com/polarstoat/films-watched/blob/main/LICENSE.txt) [![Code style](https://img.shields.io/badge/code_style-airbnb--base-FF5A5F)](https://github.com/airbnb/javascript)

> Update a Tumblr blog post with Trakt watch history

This project gets a user's watch history from [Trakt](https://trakt.tv/dashboard), formats it nicely as markdown, and then updates the contents of a blog post on [Tumblr](https://www.tumblr.com) with it.

## Install
1. Clone this repository
   ```sh
   # with Git
   $ git clone https://github.com/polarstoat/films-watched.git
   
   # or with GitHub CLI
   $ gh repo clone polarstoat/films-watched
   ```
2. Move into the newly created folder
   ```sh
   $ cd films-watched
   ```
3. Install the project's dependencies
   ```sh
   $ npm install
   ```

## Setup
1. Create a `.env` ([dotenv](https://github.com/motdotla/dotenv)) file in the project's root folder with the below environment variables

   ```
   # https://trakt.tv/oauth/applications
   TRAKT_CLIENT_ID=""
   TRAKT_CLIENT_SECRET=""
   
   # https://www.tumblr.com/oauth/apps
   TUMBLR_CONSUMER_KEY=""
   TUMBLR_CONSUMER_SECRET=""
   TUMBLR_TOKEN=""
   TUMBLR_TOKEN_SECRET=""
   ```
2. Register for the [Trakt](https://trakt.tv/oauth/applications) and [Tumblr](https://www.tumblr.com/oauth/apps) APIs, then add your API keys to the `.env` file
3. Run the Trakt authentication script, then follow the provided instructions to get a token
   ```sh
   $ node trakt.authenticate.js
   [auth] Authenticate this device with the code 0123CDEF at https://trakt.tv/activate
   [auth] Got token 456789ab… (expires Fri, 11 Oct 2024 19:24:00 GMT) and saved it to the config file
   ```
4. Add Tumblr blog details to the config file

   ```json
   {
   	"traktToken": {
   		"access_token": "",
   		"expires": 1234567891011,
   		"refresh_token": ""
   	},
   	"tumblrBlogName": "YOUR_TUMBLR_BLOG_NAME_HERE",
   	"syncs": [
   		{
   			"tumblrPostID": "YOUR_TUMBLR_POST_ID_HERE",
   			"tumblrReadMoreLinkPosition": 7,
   			"startingText": "",
   			"includeYearHeadings": true,
   			"traktAPIMethod": "history"
   		}
   	]
   }
   ```
   ##### Config file locations

   - macOS: `~/Library/Preferences/films-watched-nodejs`
   - Windows: `%APPDATA%\films-watched-nodejs\Config` (for example, `C:\Users\USERNAME\AppData\Roaming\films-watched-nodejs\Config`)
   - Linux: `~/.config/films-watched-nodejs` (or `$XDG_CONFIG_HOME/films-watched-nodejs`)

## Usage
This project is intended to be run with cron. The following cron job starts this script at 4:00AM every day, saving the output of both `STDOUT` and `STDERR` to the `~/.local/state/films-watched-nodejs/output.log` log file.

```
0 4 * * * cd /home/USERNAME/films-watched && node ./app.js >> /home/USERNAME/.local/state/films-watched-nodejs/output.log 2>&1
```

### Notes

- The script must be run from the project's root folder (thus the `cd`) otherwise the `.env` file isn't loaded
- Remember to use absolute paths in the cron job; the shell cron jobs are run in is `sh` by default, not `bash`, and therefore `~` won't correctly expand to the user's home directory

### Setting the log level

The environment variable `LOG_LEVEL` is used to set to the log level, and will default to `info` if not specified.


## Project structure

```sh
$ tree --dirsfirst -laI 'node_modules|.git|*.sublime-*'
.
├── utils
│   ├── config.js
│   ├── isEqual.js
│   ├── logger.js
│   └── validateEnvironmentVariables.js
├── .env
├── .eslintrc.cjs
├── .gitignore
├── LICENSE.txt
├── README.md
├── app.js
├── format.js
├── package-lock.json
├── package.json
├── trakt.authenticate.js
├── trakt.export.js
├── trakt.js
└── tumblr.update.js
```
