# API

The oboe function
---------------

Oboe.js exposes only one function, `oboe`, which is used to instantiate a new Oboe instance
and normally starts a new HTTP request.

```js
oboe( String url ) // makes a GET request
      
oboe({
   method: String,  // defaults to GET
   url: String,
   headers:{ key: value, ... },
   body: Object|String,
   cached: Boolean
})
```

```js
// The oboe.doFoo() methods are deprecated 
// and will be removed in v2.0.0:
oboe.doGet(    String url )
oboe.doDelete( String url )
oboe.doPost(   String url, Object|String body )
oboe.doPut(    String url, Object|String body )
oboe.doPatch(  String url, Object|String body )              

oboe.doGet(    {url:String, headers:{ key: value, ... }}, cached:Boolean )       
oboe.doDelete( {url:String, headers:{ key: value, ... }} )   
oboe.doPost(   {url:String, headers:{ key: value, ... }, body:Object|String} )
oboe.doPut(    {url:String, headers:{ key: value, ... }, body:Object|String} )       
oboe.doPatch(  {url:String, headers:{ key: value, ... }, body:Object|String} )
```

The `method`, `body`, and `headers` arguments are optional.
If `body` is given as an object it will be stringified prior to sending. 
If the cached option is set to false cachebusting will be applied by
appending `_={timestamp}` to the URL's query string.

Under Node.js you may also pass oboe an arbitrary
[ReadableStream](http://nodejs.org/api/stream.html#stream_class_stream_readable)
as the sole argument. In this case it is your responsibility to set up the stream and Oboe will not initiate 
a new HTTP request on your behalf.

```js
oboe( ReadableStream source ) // Node.js only
```
 
node event
----------

An Oboe instance emits `node` and `path` events as items of interest are detected in the stream.
The methods `.node()`, `.path()`, and `.on` may be used to register callbacks which will later be notified 
if suitable nodes and paths are found.
A specifier for which items are interesting to the caller is given using JSONPath as the listeners
are registered.

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

When the callback is notified, the context - `this` - will be the Oboe instance,
unless it is bound otherwise. The callback receives three parameters: 

|             |              |     
|-------------|--------------|
| `node`      | The node that was found in the JSON stream. This can be any valid JSON type - `Array`, `Object`, `String`, `true`, `false` or `null` 
| `path`      | An array of strings describing the path from the root of the JSON to the matching item. For example, if the match is at `(root).foo.bar` this array will equal `['foo', 'bar']`
| `ancestors` | An array of the found item's ancestors such that `ancestors[0]` is the JSON root, `ancestors[ancestors.length-1]` is the parent object, and `ancestors[ancestors.length-2]` is the grandparent. These ancestors will be *as complete as possible* given the data which has so far been read from the stream but because Oboe.js is a streaming parser may not yet have all properties.

```js
oboe('friends.json')
   .node('name', function(name){
      console.log('You have a friend called', name);
   });
```

path event
----------

Oboe `path` events are similar to `node` events except that they are emitted as soon as matching paths are found,
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

done event
----------

```js
.done(callback)

.on('done', callback)
```

Done events are fired when the response is complete. The handler is passed the entire
parsed JSON.

In most cases it is better to read the json in small parts by listening to `node` events
(see [above](#node-and-path-events)) than waiting for it to be completely download.

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

The `start` event is fired once Oboe
has parsed the status code and the response headers but not yet any content 
from the response body.

|             |          |                             
|-------------|----------|------------------------
| `status`    | `Number` | HTTP status code 
| `headers`   | `Object` | Object of response headers

This event is never fired for non-HTTP streams.

```js
oboe('resource.json')
   .on('start', function(status, headers){
      console.log('Resource cached for', headers.Age, 'secs');
   });
```

fail event
-------

```js
   .fail(Function callback)
   
   .on('fail', callback)
```

Fetching a resource could fail for several reasons:

 * Non-2xx status code
 * Connection lost
 * Invalid JSON from the server
 * Error thrown by an event listener

An object is given to the listener with four fields:

| Field        | Meaning                                                 
|--------------|---------------------------------------------------------
| `thrown`     | The error, if one was thrown                            
| `statusCode` | The status code, if the request got that far            
| `body`       | The response body for the error, if any                 
| `jsonBody`   | If the server's error response was JSON, the parsed body

```js
oboe('/content')
   .fail(function( errorReport ){
      if( 404 == errorReport.statusCode ){
         console.error('no such content'); 
      }
   });
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

`.header()` returns `undefined` if the headers have not yet been received. The headers 
are available anytime after the `start` event has been emitted. In practice this means
from inside any `node`, `path`, `start` or `done` callbacks.

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

```js
.root()
```

At any time, call `.root()` on the oboe instance to get the JSON parsed so far. 
If nothing has been received yet this will return `undefined`.

.forget()
---------

```js
.node('*', function(){
   this.forget();
})
```

`.forget()` is a shortcut for [.removeListener()](#-removelistener-) in
the case where the listner to be removed is currently executing. 
Calling `.forget()` on the Oboe instance from inside a `node` or `path` event 
listener de-registers that callback.

```js
// Display the first ten items from an array
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

Remove a `node`, `path`, `start`, `done`, or `fail` listener.

From inside the node and path listeners calling [.forget()](#-forget-)
is usually more convenient since it is not required to store a reference
to the callback but `.removeListener()`
has the advantage that it can be called from anywhere.

.abort()
--------

Calling `.abort()` stops an ongoing HTTP call at any time. 
You are guaranteed not to get any further `path` or `node` 
callbacks, even if the underlying transport has unparsed buffered content.
After calling `.abort()` the `done` event will not fire.

Under Node.js, if the Oboe instance is reading from a stream that it did not create
this method deregisters all listeners but it is the caller's responsibility to
actually terminate the streaming.

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
