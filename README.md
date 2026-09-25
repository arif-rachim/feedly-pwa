# feedly-pwa

A mobile-friendly news reader that shows articles from a Feedly account's categories. A small Express server proxies requests to the Feedly Cloud API with a server-side access token and caches responses; the front end is plain JavaScript with no framework.

> Built in 2018. Not actively maintained. Despite the name, there is no service worker or web app manifest.

## Features

- Category menu loaded from the Feedly `v3/categories` endpoint
- Article list per category from `v3/streams/contents`, with a "Load More" button using Feedly continuation tokens
- Article cards with title and image (from the Feedly visual, or extracted from the summary for Google News items); tapping opens the original article
- Header that hides on scroll down and reappears on scroll up
- Server proxy at `/api/*` for GET and POST, with an 8-hour in-memory cache for GET requests
- Login form and logout button (the login check is currently commented out, so the reader opens directly)
- Small `on.js` helper that binds behaviour to elements when they are inserted into the DOM (via a CSS animation event)

## Tech stack

JavaScript (ES modules) · Express 4 · node-fetch · Rollup · Babel · Gulp

## Getting started

The server needs a Feedly developer access token. It is currently set in the `Authorization` header object in `index.js`; replace it with your own token (ideally read from an environment variable) before running.

```bash
npm install
npm start          # serves public/ and the /api proxy on PORT (default 8080)
```

Rebuild the browser bundle after changing `public/src`:

```bash
npm run build      # rollup (public/src/main.js -> public/bundle.js), then babel
```

`public/index.html` loads `bundle.js`; `public/index-src.html` loads the ES module sources directly for development. The `rollup` gulp task uses the Windows `%CD%` variable, so on macOS/Linux run `npx rollup -c` instead.

## Project layout

```
index.js             Express server and Feedly API proxy
public/
  index.html         production page (bundle.js)
  index-src.html     development page (ES modules)
  src/main.js        app bootstrap
  src/on.js          DOM-insertion binding helper
  src/page/          login page, category navigation, article list
rollup.config.js     bundle config
gulpfile.js          rollup and babel tasks
```

## License

MIT
