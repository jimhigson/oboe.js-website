Download
========

Versions
--------

The latest stable version is *{{latestTag}}*. Older versions are also [available via Github]({{repo}}/releases).

Node.js
-------

Install [Oboe from NPM](http://www.npmjs.org/package/oboe):

``` bash
$ npm install oboe
```

Add `--save` if you want to keep Oboe as a dependency in your package.json file:

``` bash
$ npm install oboe --save
```

Once installed load as usual:

``` javascript
var oboe = require('oboe');
```

Downloading manually for the Browser
-----------------------------------

Save one of these files:
 
 * [oboe-browser.js]({{releasedJs}}/oboe-browser.js) for development 
 * [oboe-browser.min.js]({{releasedJs}}/oboe-browser.min.js) - minified for production. The size after gzip is 4.9k.
  
Using Bower package manager
-----------

You can fetch using [Bower](http://bower.io/) like this:

``` bash
$ bower install oboe
```

Using Jam package manager
---------

Oboe.js is also [available](http://jamjs.org/packages/#/details/oboe) through [Jam](http://jamjs.org/):

``` bash
$ jam install oboe
```

Loading using AMD
-----------------

If there is no AMD present, once the Oboe Javascript is loaded you can start 
using the global `oboe` object. However, when AMD is detected Oboe `defines` itself instead 
of adding itself as global variable.

When AMD is used Oboe can be accessed asynchronously using `require`:

``` javascript
require( ['oboe'], function( oboe ) {
   
});
```

If you know Oboe has already been loaded you can also access it synchronously although this
is usually not the best way:

``` javascript
var oboe = require('oboe');
```

Configuration for Browserify
----------------------------

Oboe needs a little config so that [browserify](http://browserify.org/) can package it into your app. This is because:

* Oboe has different versions for node and browsers. Without any config Browserify will try to package the Node one.
* Oboe needs to sit close to the native XHR. Browserify's wraps XHR in a node-like shim. Oboe prefers the real thing.
* Oboe's browser package isn't defined as a common-js module. [Browserify-shim](https://github.com/thlorenz/browserify-shim)
fixes this.

If you haven't already, get Oboe and browserify-shim from npm.

```
npm install oboe browserify-shim --save
```

In `package.json` add the following:

``` javascript
{
  "browserify": {
    "transform": [
      "browserify-shim"
    ]
  },
  "browser": {
    "oboe": "./node_modules/oboe/dist/oboe-browser.js"
  },
  "browserify-shim": {
    "oboe": {
      "exports": "oboe"
    }
  }
}
```

Oboe should now work as usual from Browserify'd projects, bringing in the browser-specific version. Call
`require('oboe')` as usual to bring in the shimmed, browser-specific version of Oboe.


Configuration for Require.js
------------------------

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

This is similar to the [config required to use jQuery with Require](http://requirejs.org/docs/jquery.html).

Polyfills
---------

If you need Oboe to work with older versions of Internet Explorer polyfils such as
[ES5-shim](http://github.com/es-shims/es5-shim) are required to bring the environment
up to ECMAScript 5.
