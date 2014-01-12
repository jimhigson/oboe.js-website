# Downloading Oboe.js

Versions
--------

The latest stable version is *{{latestTag}}*.

Older versions are [available on Github]({{RAW_REPO_LOCATION}}/releases).

Downloading for the Browser
---------------------------

Grab one of these files:
 
 * [oboe-browser.js]({{releasedJs}}/oboe-browser.js) (For development)
 * [oboe-browser.min.js]({{releasedJs}}/oboe-browser.min.js) (Minified for production) 
 
If you prefer to use [bower](http://bower.io/) for JS dependency management you can fetch Oboe like this:

``` bash
$ bower install oboe
```

If there is no AMD present, once the Oboe Javascript is loaded you can start using the global `oboe` object.

Loading Oboe via AMD
--------------------

If AMD is detected Oboe will `define` itself instead of adding to the 
global namespace.

When using with Require.js some config is needed so Require knows to load a file
named `oboe-browser.js` for the `oboe` module. Alternatively, you could rename
`oboe-browser.js` to `oboe.js`.

``` javascript
require.config({
    paths: {
        oboe: 'oboe-browser'
    }
});
```

Node.js
-------

Install using NPM:

``` bash
$ npm install oboe
```

Then load as usual:

``` javascript
var oboe = require('oboe');
```
