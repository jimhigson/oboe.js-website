# API

The oboe function
---------------

Oboe.js exposes only one function, `oboe`, which is used to instantiate a new Oboe instance.
Calling this function starts a new HTTP request unless the caller is 
[managing the stream themselves](#byo-stream).

```js
oboe( String url )
      
oboe({
   url: String,
   method: String,          // optional
   headers: Object,         // optional
   body: String|Object,     // optional
   cached: Boolean,         // optional
   withCredentials: Boolean // optional, browser only
})
```

```js
// the doMethod style of calling is deprecated 
// and will be removed in v2.0.0:
oboe.doGet(    url )
oboe.doDelete( url )
oboe.doPost(   url, body )
oboe.doPut(    url, body )
oboe.doPatch(  url, body )

oboe.doGet(    {url:String, headers:Object, cached:Boolean} )
oboe.doDelete( {url:String, headers:Object, cached:Boolean} )
oboe.doPost(   {url:String, headers:Object, cached:Boolean, body:String|Object} )
oboe.doPut(    {url:String, headers:Object, cached:Boolean, body:String|Object} )
oboe.doPatch(  {url:String, headers:Object, cached:Boolean, body:String|Object} )
```

The `method`, `headers`, `body`, `cached`, and `withCredentials` arguments are optional.

* If `method` is not given Oboe defaults to `GET`.
* If `body` is given as an object it will be stringified using `JSON.stringify` 
prior to sending. The Content-Type request header will automatically be set to `text/json`
unless a different value is explicitly given.
* If the cached option is given as `false` cachebusting will be applied by
appending `_={timestamp}` to the URL's query string. Any other value will be
ignored.

Cross-domain requests
---------------------

Oboe.js is able to make cross-domain requests so long as the server
is set up for <abbr title="Cross-site HTTP requests">CORS</abbr>, for example by setting the
[Access-Control-Allow-Origin](http://developer.mozilla.org/en/docs/HTTP/Access_control_CORS#Access-Control-Allow-Origin)
response header.

* If `withCredentials` is given as `true`, cookies and other auth will be propagated to
cross-domain requests as per the [XHR spec](http://www.w3.org/TR/2014/WD-XMLHttpRequest-20140130/#the-withcredentials-attribute).
For this to work the server must be set up to send the 
[Access-Control-Allow-Credentials](http://developer.mozilla.org/en/docs/HTTP/Access_control_CORS#Access-Control-Allow-Credentials)
response header.

Note that [Internet Explorer only fully supports CORS from version 10 onwards](http://enable-cors.org/client.html).

When making requests from Node the `withCredentials` option is never needed and is ignored.
[The cors middleware](https://www.npmjs.org/package/cors) might be useful if you are
serving cross-domain requests from Express/Connect.

BYO stream
----------

Under Node.js you may also pass `oboe` an arbitrary
[ReadableStream](http://nodejs.org/api/stream.html#stream_class_stream_readable)
for it to read JSON from.
It is your responsibility to initiate the stream and Oboe will not start 
a new HTTP request on your behalf.

```js
oboe( stream )   // Node.js only
```
 
node event
----------

The methods `.node()` and `.on()` are used to register interest in particular nodes by providing 
JSONPath patterns. As the JSON stream is parsed the Oboe instance checks for matches 
against these patterns and when a matching node is found it emits a `node` event.
 
```js
.on('node', pattern, callback)

// 2-argument style .on() ala Node.js EventEmitter#on
.on('node:{pattern}', callback)

.node(pattern, callback)

// register several listeners at once
.node({
   pattern1 : callback1,
   pattern2 : callback2
});
```

When the callback is notified, the context, `this`, is the Oboe instance,
unless it is bound otherwise. The callback receives three parameters: 

|             |              |     
|-------------|--------------|
| `node`      | The node that was found in the JSON stream. This can be any valid JSON type - `Array`, `Object`, `String`, `Boolean` or `null`
| `path`      | An array of strings describing the path from the root of the JSON to the matching item. For example, if the match is at `(root).foo.bar` this array will equal `['foo', 'bar']`. [Example usage](examples#taking-meaning-from-a-node-s-location).
| `ancestors` | An array of the found item's ancestors such that `ancestors[0]` is the JSON root, `ancestors[ancestors.length-1]` is the parent object, and `ancestors[ancestors.length-2]` is the grandparent. These ancestors will be as complete as possible given the data which has so far been read from the stream but because Oboe.js is a streaming parser they may not yet have all properties

```js
oboe('friends.json')
   .node('name', function(name){
      console.log('You have a friend called', name);
   });
```

transforming the JSON
---------------------

If the callback returns any value, the returned value will be used to replace the parsed JSON node.

See [demarshalling to an OOP model](examples#demarshalling-json-to-an-oop-model)
and [Transforming JSON while it is streaming](examples#transforming-json-while-it-is-streaming).

```js
// Replace any object with a name, date of birth, and address 
// in the JSON with a Person instance
  
.on('node', '{name dob address}', function(personJson){
   return new Person(personJson.name, personJson.dob, personJson.address);
})
```

dropping nodes
--------------

If a node listener returns the special value `oboe.drop`, the detected node is dropped entirely
from the tree.

This can be used to ignore fields that you don't care about,
or to [load large JSON without running out of memory]().

```js  
.on('node', 'person.address', function(address){
   return oboe.drop;
})
```

```oboe.drop``` can also be used in a shorthand form:

```js  
.on('node', 'person.address', oboe.drop)
```

path event
----------

Path events are identical to [node events](#node-event) except that they are emitted as soon as matching paths are found,
without waiting for the thing at the path to be revealed.


```js
.on('path', pattern, callback)

// 2-argument style .on() ala Node.js EventEmitter#on
.on('path:{pattern}', callback)

.path(pattern, callback)

// register several listeners at once
.path({
   pattern1 : callback1,
   pattern2 : callback2
});
```

```js
oboe('friends.json')
   .path('friend', function(name){
      friendCount++;
   });
```

One use of path events is to [start adding elements to an interface before they are complete](examples#reacting-before-we-get-the-whole-object).

done event
----------

```js
.done(callback)

.on('done', callback)
```

Done events are fired when the response is complete. The callback is passed the entire
parsed JSON.

In most cases it is faster to read the JSON in small parts by listening to `node` events
(see [above](#node-event)) than waiting for it to be completely download.

```js
oboe('resource.json')
   .on('done', function(parsedJson){
      console.log('Request complete', parsedJson);
   });
```

start event
-----------

```js
.start(callback)

.on('start', callback)
```

Start events are fired when Oboe
has parsed the status code and the response headers but has not yet received any content 
from the response body.

The callback receives two parameters: 

| name        | type     |                              
|-------------|----------|------------------------
| `status`    | `Number` | HTTP status code 
| `headers`   | `Object` | Object of response headers

```js
oboe('resource.json')
   .on('start', function(status, headers){
      console.log('Resource cached for', headers.Age, 'secs');
   });
```

Under Node.js this event is never fired for [BYO streaming](#byo-stream).

fail event
-------

```js
   .fail(callback)
   
   .on('fail', callback)
```

Fetching a resource could fail for several reasons:

 * Non-2xx status code
 * Connection lost
 * Invalid JSON from the server
 * Error thrown by an event listener

The fail callback receives an object with four fields:

| Field        | Meaning                                                 
|--------------|---------------------------------------------------------
| `thrown`     | The error, if one was thrown                            
| `statusCode` | The status code, if the request got that far            
| `body`       | The response body for the error, if any                 
| `jsonBody`   | If the server's error response was JSON, the parsed body

```js
oboe('/content')
   .fail( function( errorReport ){
      if( 404 == errorReport.statusCode ){
         console.error('no such content'); 
      }
   });
```

.source
-------

*Since v.1.15.0*

Gives the URL (or [stream](#byo-stream)) that the Oboe instance
is fetching from. This is sometimes useful if one handler is being used
for several streams.

```js
oboe('http://example.com/names.json')
   .node('name', handleName);
   
oboe('http://example.com/more_names.json')
   .node('name', handleName);   
   
function handleName(name){
   console.log('got name', name, 'from', this.source);
}   
```

.header([name])
---------------

```js
.header()

.header(name)
```

`.header()` returns one or more HTTP response headers.
If the name parameter is given that named header will be returned as a String,
otherwise all headers are returned as an Object.

`undefined` wil be returned if the headers have not yet been received. The headers 
are available anytime after the `start` event has been emitted. They will always be
available from inside a `node`, `path`, `start` or `done` callback.

`.header()` always returns undefined for non-HTTP streams.

```js
oboe('data.json')
   .node('id', function(id){
      console.log(   'Server has id', id, 
                     'as of', this.headers('Date'));
   });
```

.root()
-------

At any time, call `.root()` on the oboe instance to get the JSON parsed so far. 
If nothing has yet been received this will return `undefined`.

```js
var interval;

oboe('resourceUrl')
   .start(function(){
      interval = window.setInterval(function(){
         console.log('downloaded so far:', this.root());
      }.bind(this), 10);
   })
   .done(function(completeJson){
      console.log('download finished:', completeJson);
      window.clearInterval(interval);
   });
```

.forget()
---------

```js
.node('*', function(){
   this.forget();
})
```

`.forget()` is a shortcut for [.removeListener()](#-removelistener-) in
the case where the listener to be removed is currently executing. 
Calling `.forget()` on the Oboe instance from inside a `node` or `path` 
callback de-registers that callback.

```js
// Display only the first ten downloaded items
// but place all in the model 

oboe('/content')
   .node('!.*', function(item, path){
      if( path[0] == 9 )
         this.forget();
      
      displayItem(item);
   })
   .node('!.*', function(item){   
      addToModel(item);
   });
```

.removeListener()
-----------------

```js
.removeListener('node', pattern, callback)
.removeListener('node:{pattern}', pattern, callback)

.removeListener('path', pattern, callback)
.removeListener('path:{pattern}', pattern, callback)

.removeListener('start', callback)
.removeListener('done', callback)
.removeListener('fail', callback)
```

Remove any listener on the Oboe instance.

From inside node and path callbacks [.forget()](#-forget-)
is usually more convenient because it does not require that the programmer stores a reference
to the callback function. However, `.removeListener()`
has the advantage that it may be called from anywhere.

.abort()
--------

Calling `.abort()` stops an ongoing HTTP call at any time. 
You are guaranteed not to get any further `path` or `node` 
callbacks, even if the underlying transport has unparsed buffered content.
After calling `.abort()` the `done` event will not fire.

Under Node.js, if the Oboe instance is reading from a stream that it did not create
this method deregisters all listeners but it is the caller's responsibility to
actually terminate the streaming.

```js
// Display the first nine nodes, then hang up 
oboe('/content')
   .node('!.*', function(item){   
      display(item);
   })
   .node('![9]', function(){
      this.abort();
   });
```

Pattern matching
----------------

Oboe's pattern matching is a variation on [JSONPath](https://code.google.com/p/json-path/). It supports these clauses:

| Clause         | Meaning             |     
|----------------|---------------------|
| `!`            | Root object                                                                                      
| `.`            | Path separator                                                                                  
| `person`       | An element under the key 'person'                                                               
| `{name email}` | An element with attributes name and email                                                       
| `*`            | Any element at any name                                                                         
| `[2]`          | The second element (of an array)                                                                
| `['foo']`      | Equivalent to .foo                                                                              
| `[*]`          | Equivalent to .*                                                                                
| `..`           | Any number of intermediate nodes (non-greedy)
| `$`            | Explicitly specify an intermediate clause in the jsonpath spec the callback should be applied to

The pattern engine supports 
[CSS-4 style node selection](/examples/#css4-style-patterns)
using the dollar, `$`, symbol. See also [the example patterns](/examples/#example-patterns). 

Browser support
---------------

These browsers have full support:

* Recent Chrome
* Recent Firefox
* Recent Safari
* Internet Explorer 10

These browsers will run Oboe but not stream:

* Internet explorer 8 and 9, given [appropriate shims for ECMAScript 5](https://github.com/kriskowal/es5-shim/blob/master/es5-sham.js)
 
Unfortunately, <abbr title="Internet Explorer">IE</abbr> before version 10 
[doesn't provide any convenient way to read an http request while it is in progress](http://blogs.msdn.com/b/ieinternals/archive/2010/04/06/comet-streaming-in-internet-explorer-with-xmlhttprequest-and-xdomainrequest.aspx).
It may be possible to add support for limited streaming in Internet Explorer 8 and 9 using the proprietary
[XDomainRequest](http://msdn.microsoft.com/en-us/library/cc288060%28VS.85%29.aspx)
but this object is has a reduced API and is buggy -
[only GET and POST are supported and it does not allow HTTP headers to be set](http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx).
It also requires that responses set the `Access-Control-Allow-Origin` 
header and fails in IE8 for users browsing using InPrivate mode.

The good news is that in older versions of IE Oboe gracefully degrades.
It falls back to waiting for the whole response to return, then fires
all the events instantaneously.
You don't get streaming but the responsiveness is no worse than if you
had used a non-streaming AJAX download.
