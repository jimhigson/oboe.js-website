# Installing

## Browser

For the client-side grab either [oboe-browser.js](https://raw.github.com/jimhigson/oboe.js/master/dist/oboe-browser.js)
or [oboe-browser.min.js](https://raw.github.com/jimhigson/oboe.js/master/dist/oboe-browser.min.js), or use [bower](http://bower.io/) like:

```
bower install oboe
```

If AMD is detected Oboe will `define` itself. Otherwise it adds `oboe` to
the global namespace. Either load the module using require.js, [almond](https://github.com/jrburke/almond)
etc or just use it directly.

If using with Require some config is needed so Require knows to load a file
named `oboe-browser.js` for the `oboe` module. Alternatively, you could rename
`oboe-browser.js` to `oboe.js`.

``` javascript
require.config({
    paths: {
        oboe: 'oboe-browser'
    }
});
```

## Node.js 

```
npm install oboe
```

Then load as usual:

``` javascript
var oboe = require('oboe');
```