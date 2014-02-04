Why use Oboe.js?
================

In Summary
----------

Using streaming to load data is usually faster. The biggest advantages come with large
responses, mobile networks, or reading from streaming
JSON services.

Oboe.js might be marginally
slower for messages that load *very* quickly 
but in almost all real-world cases reacting to i/o sooner beats
fussing about CPU usage.


Downloading REST resources
--------------------------

Let's start with the standard pattern found on most AJAX-powered sites.
We have a client-side web application and a server which provides it with JSON.
The page won't be updated until the response is complete.

{{demo "fast-ajax-discrete"}}

On a good connection there isn't much time to save but we can give a more responsive
feel by using streaming.

{{demo "fast-ajax-progressive"}}

Let's say that our server gets the data for some modules faster than others. Using
the usual AJAX pattern displaying any data would have to wait until the slowest component
is done. With Oboe we can start displaying data as soon as we have it.

{{demo "streaming-ajax-progressive"}}

This requires a server that can write out the JSON as a stream. The 
response when it completes is 100% valid JSON so it remains compatible 
with standard AJAX tools.

Mobile data connections
-----------------------

Mobile networks today are high-bandwidth but can also be
high-latency and come with inconsistent packet delivery times.
This is why buffered content like streaming HD video plays
fluidly but web surfing still feels laggy.

{{demo "mobile-discrete"}}

If the client uses Oboe.js we can show everything as soon as it arrives:

{{demo "mobile-progressive"}}

This is about showing the user useful data sooner. In itself, progressive
display also improves the user perception of performance.

Dropped connections
-------------------

Oboe.js can provides improved tolerance when connections are dropped.
Most AJAX frameworks equate a dropped connection with total failure and discard
the partially transferred data.

Although not ideal, in the situation where we have partially transferred data
using it is usually preferable to throwing it away.
It probably contains information that your user is interested in reading.

In the next example we have a mobile connection which fails when the
user enters a building:

{{demo "mobile-fail-discrete"}}

Oboe takes a more nuanced approach by viewing the HTTP response as a
series of small, useful parts. If the connection is lost it is simply
the case that some parts were successful and were used immediately,
while others did not arrive.
Using the data from partial responses requires no special
cases or extra programming.

In the example below the client is smart enough so that when the network
comes back it only requests the data that it missed the first time.

{{demo "mobile-fail-progressive"}}

Aggregating resources
---------------------

-   waiting for the last one

{{demo "aggregated-discrete"}}

-   don't let one slow resource slow everything down.
-   don't slow everything's display down to the speed of the slowest
    component

{{demo "aggregated-progressive"}}

Historic and live data on the same transport
--------------------------------------------

REST talks in the language of resources, not services. URLs should
identify things, not endpoints. It shouldn't matter if the server has
the thing now or if it will send it later when it does have it, or some
combination of both.

You got to a page, you get the 'old' data and then are kept up to date
with 'live' events. We normally use two transports for this, but
wouldn't it be nicer if we didn't have to handle distinct cases?

{{demo "historic-and-live"}}

If we treat the historic part as a stream and the streaming becomes
trivial. Handle both with the same code, with no divergent code to
write.

*write: Why this is more like REST. Why REST is good.*

Combining REST and streaming for cacheability
---------------------------------------------

In some use cases Oboe can be used to bring REST
and streaming together rather than choosing non-REST technique such as Websockets.

[Above](#historic-and-live-data-on-the-same-transport) we had a JSON
server which intentionally never completes its response. Here we have a
different example: a datastream which will complete. Although streaming
is used this case can be treated according to the standard REST paradigm
and plays nice with well designed intermediaries such as caches.

The visualisation below includes a cartogram inspired by [this file on
Wikipedia](http://en.wikipedia.org/wiki/File:Cartogram%E2%80%942012_Electoral_Vote.svg)
and simulates each state's results being announced in the [2012 United
States presidential
election](http://en.wikipedia.org/wiki/United_States_presidential_election,_2012)
by condensing several hours into a minute to so.

{{demo "caching"}}

*Incorporate and break up*:

The REST service gives results per-state for the for the [United States
presidential election,
2012](http://en.wikipedia.org/wiki/United_States_presidential_election,_2012).
While the results are being announced, requesting them returns an
incomplete JSON with the states known so far be immediately sent,
followed by the remainder dispatched individually as the results are
called. When all results are known the JSON would finally close leaving
a complete resource.

After the event, somebody wishing to fetch the results would use the
*same URL for the historic data as was used on the night for the live
data*. This is possible because the URL refers only to the data that is
required, not to whether it is current or historic. Because it
eventually forms a complete HTTP response, the data that was streamed is
not incompatible with HTTP caching and a cache which saw the data while
it was live could later serve it from cache as historic. More
sophisticated caches located between client and service would recognise
when a new request has the same URL as an already ongoing request, serve
the response received so far, and then continue by giving both inbound
requests the content as it arrives from the already established outbound
request. Hence, the resource would be cacheable even while the election
results are streaming and a service would only have to provide one
stream to serve the same live data to multiple users fronted by the same
cache. An application developer programming with Oboe would not have to
handle live and historic data as separate cases because the node and
path events they receive are the same. Without branching, the code which
displays results as they are announced would automatically be able to
show historic data.
